import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { getAuthUser } from '../middleware/authHandlers.ts';
import FriendService from '../services/FriendService.ts';

class FriendController {

    /**
     * Récupère les amis de l'utilisateur et ses demandes en attente
     */
    list = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);

        const friendList = await FriendService.list(userId);

        res.status(200).json({
            success: true,
            data: friendList,
            message: 'Amis récupérés avec succès',
        });
    };

    /**
     * Envoie une demande d'ami
     */
    sendRequest = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const target = matchedData<{ username?: string; userId?: string }>(req, { locations: ['body'] });

        const friendship = await FriendService.sendRequest(userId, target);

        res.status(201).json({
            success: true,
            data: friendship,
            message: friendship.status === 'accepted' ? 'Vous êtes maintenant amis' : "Demande d'ami envoyée",
        });
    };

    /**
     * Accepte une demande d'ami reçue
     */
    accept = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { friendshipId } = matchedData<{ friendshipId: string }>(req);

        const friendship = await FriendService.accept(friendshipId, userId);

        res.status(200).json({
            success: true,
            data: friendship,
            message: 'Vous êtes maintenant amis',
        });
    };

    /**
     * Refuse ou annule une demande, ou retire un ami
     */
    remove = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { friendshipId } = matchedData<{ friendshipId: string }>(req);

        await FriendService.remove(friendshipId, userId);

        res.status(200).json({
            success: true,
            data: { _id: friendshipId },
            message: 'Relation supprimée',
        });
    };
}

export default new FriendController();
