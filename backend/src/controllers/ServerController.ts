import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { getAuthUser } from '../middleware/authHandlers.ts';
import ServerService from '../services/ServerService.ts';

class ServerController {

    /**
     * Crée un nouveau serveur
     */
    create = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { name } = matchedData<{ name: string }>(req);

        const server = await ServerService.create(name, userId);

        res.status(201).json({
            success: true,
            data: { server },
            message: 'Serveur créé.',
        });
    };

    /**
     * Récupère la liste des serveurs auxquels l'utilisateur appartient
     */
    getByUserId = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);

        const servers = await ServerService.getByUserId(userId);

        res.status(200).json({
            success: true,
            data: servers,
            message: "Liste des serveurs auxquels l'utilisateur appartient.",
        });
    };

    /**
     * Récupère un serveur et la liste de ses membres
     */
    getById = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { serverId } = matchedData<{ serverId: string }>(req);

        const server = await ServerService.getById(serverId, userId);

        res.status(200).json({
            success: true,
            data: server,
            message: 'Serveur récupéré avec succès',
        });
    };
}

export default new ServerController();
