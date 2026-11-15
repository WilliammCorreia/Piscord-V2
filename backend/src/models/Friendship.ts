import { Schema, model, type Types } from 'mongoose';

export type FriendshipStatus = 'pending' | 'accepted';

export interface IFriendship {
    /** Auteur de la demande d'ami */
    requester: Types.ObjectId;
    /** Destinataire de la demande */
    recipient: Types.ObjectId;
    status: FriendshipStatus;
    /** Les deux IDs triés puis joints : une seule relation possible par paire, quel que soit le sens */
    pairKey: string;
    createdAt: Date;
    updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>({
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    pairKey: { type: String, required: true, unique: true },
}, { timestamps: true });

/**
 * Clé d'une paire d'utilisateurs. Elle sert aussi d'identifiant à leur conversation privée :
 * l'historique survit ainsi à un retrait puis un nouvel ajout en ami.
 */
export function buildPairKey(userIdA: string, userIdB: string): string {
    return [userIdA, userIdB].sort().join('_');
}

export const PAIR_KEY_PATTERN = /^[a-f0-9]{24}_[a-f0-9]{24}$/;

export const Friendship = model<IFriendship>('Friendship', FriendshipSchema);
