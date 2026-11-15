import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { getAuthUser } from '../middleware/authHandlers.ts';
import ChannelService from '../services/ChannelService.ts';

class ChannelController {

    /**
     * Récupère tous les salons d'un serveur
     */
    getByServerId = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { serverId } = matchedData<{ serverId: string }>(req);

        const channels = await ChannelService.getChannelsByServerId(serverId, userId);

        res.status(200).json({
            success: true,
            data: channels,
            message: 'Salons récupérés avec succès',
        });
    };

    /**
     * Crée un nouveau salon
     */
    create = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { name, serverId, roleIds } = matchedData<{ name: string; serverId: string; roleIds?: string[] }>(req);

        const channel = await ChannelService.create(name, serverId, userId, roleIds);

        res.status(201).json({
            success: true,
            data: channel,
            message: 'Salon créé avec succès',
        });
    };
}

export default new ChannelController();
