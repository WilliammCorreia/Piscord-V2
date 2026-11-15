import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.ts';
import FriendRepository, { type FriendshipLean } from '../repositories/FriendRepository.ts';
import UserRepository from '../repositories/UserRepository.ts';
import { emitFriendsChanged } from '../socket/index.ts';
import PresenceService from './PresenceService.ts';

export interface FriendEntry {
    /** ID de la relation : sert à la retirer */
    _id: string;
    user: { _id: string; username: string; online: boolean };
    /** Identifiant de la conversation privée avec cet ami (référence des messages) */
    conversationId: string;
}

export interface FriendRequestEntry {
    /** ID de la demande : sert à l'accepter, la refuser ou l'annuler */
    _id: string;
    user: { _id: string; username: string };
    createdAt: Date;
}

export interface FriendList {
    friends: FriendEntry[];
    /** Demandes reçues, en attente de réponse */
    incoming: FriendRequestEntry[];
    /** Demandes envoyées, en attente de réponse */
    outgoing: FriendRequestEntry[];
}

class FriendService {

    /**
     * Récupère les amis d'un utilisateur et ses demandes en attente.
     * Le statut de connexion n'est donné que pour les amis acceptés.
     */
    async list(userId: string): Promise<FriendList> {
        const friendships = await FriendRepository.findByUser(userId);
        const list: FriendList = { friends: [], incoming: [], outgoing: [] };

        for (const friendship of friendships) {
            const isRequester = friendship.requester._id.equals(userId);
            const other = isRequester ? friendship.recipient : friendship.requester;
            const user = { _id: other._id.toString(), username: other.username };
            const id = friendship._id.toString();

            if (friendship.status === 'accepted') {
                list.friends.push({
                    _id: id,
                    user: { ...user, online: PresenceService.isOnline(user._id) },
                    conversationId: friendship.pairKey,
                });
            }
            else if (isRequester) {
                list.outgoing.push({ _id: id, user, createdAt: friendship.createdAt });
            }
            else {
                list.incoming.push({ _id: id, user, createdAt: friendship.createdAt });
            }
        }

        list.friends.sort((a, b) => a.user.username.localeCompare(b.user.username));

        return list;
    }

    /**
     * Envoie une demande d'ami, désignée par un pseudo ou par un ID d'utilisateur.
     * Si l'autre avait déjà envoyé une demande, elle est acceptée : les deux le veulent.
     */
    async sendRequest(userId: string, target: { username?: string; userId?: string }): Promise<FriendshipLean> {
        const recipient = target.userId
            ? await UserRepository.findById(target.userId)
            : await UserRepository.findByUsername(target.username ?? '');

        if (!recipient) {
            throw new NotFoundError('Utilisateur introuvable', 'USER_NOT_FOUND');
        }

        const recipientId = recipient.id as string;
        if (recipientId === userId) {
            throw new BadRequestError('Vous ne pouvez pas vous ajouter vous-même', 'CANNOT_ADD_SELF');
        }

        const existing = await FriendRepository.findByPair(userId, recipientId);
        if (existing) {
            if (existing.status === 'accepted') {
                throw new ConflictError('Vous êtes déjà amis', 'ALREADY_FRIENDS');
            }
            if (existing.requester.equals(userId)) {
                throw new ConflictError('Demande déjà envoyée', 'REQUEST_ALREADY_SENT');
            }
            return await this.accept(existing._id.toString(), userId);
        }

        let friendship: FriendshipLean;
        try {
            friendship = await FriendRepository.create(userId, recipientId);
        }
        catch (err) {
            // Deux demandes croisées au même instant : l'index unique sur la paire tranche
            if ((err as { code?: number }).code === 11000) {
                throw new ConflictError('Demande déjà envoyée', 'REQUEST_ALREADY_SENT');
            }
            throw err;
        }

        emitFriendsChanged([userId, recipientId]);

        return friendship;
    }

    /**
     * Accepte une demande d'ami - réservé à son destinataire
     */
    async accept(friendshipId: string, userId: string): Promise<FriendshipLean> {
        const friendship = await FriendRepository.findById(friendshipId);
        if (!friendship) {
            throw new NotFoundError('Demande introuvable', 'FRIENDSHIP_NOT_FOUND');
        }

        if (!friendship.recipient.equals(userId)) {
            throw new ForbiddenError('Seul le destinataire peut accepter cette demande', 'NOT_ALLOWED');
        }

        const accepted = await FriendRepository.accept(friendshipId);
        if (!accepted) {
            throw new ConflictError('Cette demande a déjà été acceptée', 'ALREADY_FRIENDS');
        }

        emitFriendsChanged([accepted.requester.toString(), accepted.recipient.toString()]);

        return accepted;
    }

    /**
     * Supprime une relation : refuser ou annuler une demande, ou retirer un ami.
     * Réservé aux deux utilisateurs concernés.
     */
    async remove(friendshipId: string, userId: string): Promise<void> {
        const friendship = await FriendRepository.findById(friendshipId);
        if (!friendship) {
            throw new NotFoundError('Relation introuvable', 'FRIENDSHIP_NOT_FOUND');
        }

        if (!friendship.requester.equals(userId) && !friendship.recipient.equals(userId)) {
            throw new ForbiddenError("Cette relation ne vous concerne pas", 'NOT_ALLOWED');
        }

        await FriendRepository.deleteById(friendshipId);

        emitFriendsChanged([friendship.requester.toString(), friendship.recipient.toString()]);
    }
}

export default new FriendService();
