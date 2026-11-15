import mongoose from 'mongoose';
import { ForbiddenError, NotFoundError } from '../errors/AppError.ts';
import { PAIR_KEY_PATTERN } from '../models/Friendship.ts';
import ChannelRepository, { type ChannelLean } from '../repositories/ChannelRepository.ts';
import FriendRepository from '../repositories/FriendRepository.ts';
import ServerRepository, { type ServerLean } from '../repositories/ServerRepository.ts';

/** Destination d'un message : un salon de serveur, ou une conversation privée entre deux amis */
export type MessageReference =
    | { kind: 'channel'; channel: ChannelLean }
    | { kind: 'conversation'; participantIds: [string, string] };

/**
 * Indique si une valeur a la forme d'une référence de messages :
 * l'ID d'un salon, ou la clé d'une conversation privée (les deux IDs d'utilisateur triés).
 */
export function isReferenceId(value: unknown): value is string {
    return typeof value === 'string' && (mongoose.isValidObjectId(value) || PAIR_KEY_PATTERN.test(value));
}

/**
 * Contrôles d'accès partagés par l'API HTTP et par Socket.io.
 * Être connecté ne suffit pas : chaque ressource vérifie l'appartenance au serveur.
 */
class AccessService {

    /**
     * Vérifie qu'un utilisateur est membre d'un serveur
     * @returns Le serveur, pour éviter une seconde requête à l'appelant
     * @throws {NotFoundError} Si le serveur n'existe pas
     * @throws {ForbiddenError} Si l'utilisateur n'en est pas membre
     */
    async assertServerMember(serverId: string, userId: string): Promise<ServerLean> {
        const server = await ServerRepository.findById(serverId);
        if (!server) {
            throw new NotFoundError('Serveur introuvable', 'SERVER_NOT_FOUND');
        }

        if (!server.memberIds.some((memberId) => memberId.equals(userId))) {
            throw new ForbiddenError("Vous n'êtes pas membre de ce serveur", 'NOT_A_MEMBER');
        }

        return server;
    }

    /**
     * Vérifie qu'un utilisateur a accès à un salon (il doit être membre du serveur du salon)
     * @returns Le salon
     * @throws {NotFoundError} Si le salon n'existe pas
     * @throws {ForbiddenError} Si l'utilisateur n'est pas membre du serveur
     */
    async assertChannelAccess(channelId: string, userId: string): Promise<ChannelLean> {
        const channel = await ChannelRepository.findById(channelId);
        if (!channel) {
            throw new NotFoundError('Salon introuvable', 'CHANNEL_NOT_FOUND');
        }

        await this.assertServerMember(channel.serverId, userId);

        return channel;
    }

    /**
     * Vérifie qu'un utilisateur participe à une conversation privée et que les deux
     * participants sont toujours amis
     * @returns Les IDs des deux participants
     * @throws {ForbiddenError} Si l'utilisateur n'est pas l'un des deux, ou s'ils ne sont pas amis
     */
    async assertConversationAccess(conversationId: string, userId: string): Promise<[string, string]> {
        const [first, second] = conversationId.split('_') as [string, string];

        if (first !== userId && second !== userId) {
            throw new ForbiddenError("Vous ne participez pas à cette conversation", 'NOT_A_PARTICIPANT');
        }

        if (!(await FriendRepository.isAcceptedPair(conversationId))) {
            throw new ForbiddenError("Vous devez être amis pour échanger des messages privés", 'NOT_FRIENDS');
        }

        return [first, second];
    }

    /**
     * Vérifie l'accès à la destination d'un message, qu'il s'agisse d'un salon ou d'une conversation privée
     */
    async assertReferenceAccess(referenceId: string, userId: string): Promise<MessageReference> {
        if (PAIR_KEY_PATTERN.test(referenceId)) {
            return { kind: 'conversation', participantIds: await this.assertConversationAccess(referenceId, userId) };
        }

        return { kind: 'channel', channel: await this.assertChannelAccess(referenceId, userId) };
    }
}

export default new AccessService();
