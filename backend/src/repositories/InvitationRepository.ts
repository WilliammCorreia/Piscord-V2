import type { Types } from 'mongoose';
import { Invitation, type IInvitation } from '../models/Invitation.ts';

export type InvitationLean = IInvitation & { _id: Types.ObjectId };

class InvitationRepository {

    /**
     * Crée une nouvelle invitation
     */
    async create(data: {
        code: string;
        serverId: string;
        createdBy: string;
        expiredAt: Date | null;
        maxUsage: number | null;
    }): Promise<InvitationLean> {
        const invitation = await Invitation.create(data);
        return invitation.toObject();
    }

    /**
     * Trouve une invitation par son code
     */
    async findByCode(code: string): Promise<InvitationLean | null> {
        return await Invitation.findOne({ code }).lean<InvitationLean>();
    }

    /**
     * Récupère toutes les invitations d'un serveur, les plus récentes d'abord
     */
    async findByServerId(serverId: string): Promise<InvitationLean[]> {
        return await Invitation.find({ serverId }).sort({ createdAt: -1 }).lean<InvitationLean[]>();
    }

    /**
     * Supprime une invitation par son code
     */
    async deleteByCode(code: string): Promise<InvitationLean | null> {
        return await Invitation.findOneAndDelete({ code }).lean<InvitationLean>();
    }

    /**
     * Consomme une utilisation de l'invitation, de façon atomique.
     * La condition et l'incrément sont dans la même requête : deux personnes ne peuvent pas
     * prendre en même temps la dernière place.
     * @returns L'invitation mise à jour, ou null si elle est inactive ou épuisée
     */
    async claimUsage(invitationId: Types.ObjectId): Promise<InvitationLean | null> {
        return await Invitation.findOneAndUpdate(
            {
                _id: invitationId,
                isActive: true,
                $or: [
                    { maxUsage: null },
                    { $expr: { $lt: ['$currentUsage', '$maxUsage'] } },
                ],
            },
            { $inc: { currentUsage: 1 } },
            { new: true }
        ).lean<InvitationLean>();
    }

    /**
     * Rend une utilisation (si l'ajout du membre a échoué après claimUsage)
     */
    async releaseUsage(invitationId: Types.ObjectId): Promise<void> {
        await Invitation.updateOne({ _id: invitationId }, { $inc: { currentUsage: -1 } });
    }
}

export default new InvitationRepository();
