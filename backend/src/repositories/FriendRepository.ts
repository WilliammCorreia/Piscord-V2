import type { Types } from 'mongoose';
import { Friendship, buildPairKey, type IFriendship } from '../models/Friendship.ts';

export type FriendshipLean = IFriendship & { _id: Types.ObjectId };

interface FriendshipUser {
    _id: Types.ObjectId;
    username: string;
}

/** Relation dont les deux utilisateurs ont été peuplés (username uniquement) */
export type FriendshipWithUsers = Omit<FriendshipLean, 'requester' | 'recipient'> & {
    requester: FriendshipUser;
    recipient: FriendshipUser;
};

class FriendRepository {

    /**
     * Crée une demande d'ami en attente
     */
    async create(requesterId: string, recipientId: string): Promise<FriendshipLean> {
        const friendship = await Friendship.create({
            requester: requesterId,
            recipient: recipientId,
            pairKey: buildPairKey(requesterId, recipientId),
        });
        return friendship.toObject();
    }

    async findById(friendshipId: string): Promise<FriendshipLean | null> {
        return await Friendship.findById(friendshipId).lean<FriendshipLean>();
    }

    /**
     * Trouve la relation entre deux utilisateurs, quel que soit celui qui a fait la demande
     */
    async findByPair(userIdA: string, userIdB: string): Promise<FriendshipLean | null> {
        return await Friendship.findOne({ pairKey: buildPairKey(userIdA, userIdB) }).lean<FriendshipLean>();
    }

    /**
     * Récupère toutes les relations d'un utilisateur (amis et demandes en attente)
     */
    async findByUser(userId: string): Promise<FriendshipWithUsers[]> {
        return await Friendship.find({ $or: [{ requester: userId }, { recipient: userId }] })
            .sort({ updatedAt: -1 })
            .populate('requester', 'username')
            .populate('recipient', 'username')
            .lean<FriendshipWithUsers[]>();
    }

    /**
     * Récupère les IDs des amis (relations acceptées) d'un utilisateur
     */
    async findFriendIds(userId: string): Promise<string[]> {
        const friendships = await Friendship
            .find({ status: 'accepted', $or: [{ requester: userId }, { recipient: userId }] })
            .select('requester recipient')
            .lean<FriendshipLean[]>();

        return friendships.map((friendship) =>
            friendship.requester.equals(userId) ? friendship.recipient.toString() : friendship.requester.toString()
        );
    }

    /**
     * Indique si la paire désignée par une clé de conversation est une amitié acceptée
     */
    async isAcceptedPair(pairKey: string): Promise<boolean> {
        return (await Friendship.exists({ pairKey, status: 'accepted' })) !== null;
    }

    /**
     * Accepte une demande en attente
     * @returns La relation mise à jour, ou null si elle n'était plus en attente
     */
    async accept(friendshipId: string): Promise<FriendshipLean | null> {
        return await Friendship.findOneAndUpdate(
            { _id: friendshipId, status: 'pending' },
            { status: 'accepted' },
            { new: true }
        ).lean<FriendshipLean>();
    }

    async deleteById(friendshipId: string): Promise<void> {
        await Friendship.deleteOne({ _id: friendshipId });
    }
}

export default new FriendRepository();
