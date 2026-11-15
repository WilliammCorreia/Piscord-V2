import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { getAuthUser } from '../middleware/authHandlers.ts';
import InvitationService from '../services/InvitationService.ts';

class InvitationController {

    /**
     * Crée une nouvelle invitation
     */
    create = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { serverId, expiredAt, maxUsage } = matchedData<{
            serverId: string;
            expiredAt?: Date | null;
            maxUsage?: number | null;
        }>(req);

        const invitation = await InvitationService.createInvitation(serverId, userId, { expiredAt, maxUsage });

        res.status(201).json({
            success: true,
            data: invitation,
            message: 'Invitation créée avec succès',
        });
    };

    /**
     * Récupère toutes les invitations d'un serveur
     */
    getByServerId = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { serverId } = matchedData<{ serverId: string }>(req);

        const invitations = await InvitationService.getInvitationsByServerId(serverId, userId);

        res.status(200).json({
            success: true,
            data: invitations,
            message: 'Invitations récupérées avec succès',
        });
    };

    /**
     * Supprime une invitation
     */
    delete = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { code } = matchedData<{ code: string }>(req);

        const deletedInvitation = await InvitationService.deleteInvitation(code, userId);

        res.status(200).json({
            success: true,
            data: deletedInvitation,
            message: 'Invitation supprimée avec succès',
        });
    };

    /**
     * Rejoint un serveur via une invitation
     */
    join = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { code } = matchedData<{ code: string }>(req);

        const result = await InvitationService.joinByInvitation(code, userId);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Vous avez rejoint le serveur avec succès',
        });
    };
}

export default new InvitationController();
