import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { getAuthUser } from '../middleware/authHandlers.ts';
import MessageService from '../services/MessageService.ts';

class MessageController {

    /**
     * Crée un nouveau message et l'enregistre en base de données
     */
    create = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { content, referenceId } = matchedData<{ content: string; referenceId: string }>(req);

        const message = await MessageService.create(content, userId, referenceId);

        res.status(201).json({
            success: true,
            data: message,
            message: 'Message créé avec succès',
        });
    };

    /**
     * Récupère une page de messages d'un salon, par ordre chronologique.
     * Sans curseur : les plus récents. Avec ?before=<id> : ceux qui précèdent ce message.
     */
    getMessagesByReference = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { referenceId, before, limit } = matchedData<{ referenceId: string; before?: string; limit?: number }>(req);

        const page = await MessageService.getMessagesByReference(referenceId, userId, { before, limit });

        res.status(200).json({
            success: true,
            data: page.messages,
            hasMore: page.hasMore,
            message: 'Messages récupérés avec succès',
        });
    };

    /**
     * Supprime un message (soft delete)
     */
    deleteMessage = async (req: Request, res: Response): Promise<void> => {
        const { userId } = getAuthUser(req);
        const { messageId } = matchedData<{ messageId: string }>(req);

        await MessageService.deleteMessage(messageId, userId);

        res.status(200).json({
            success: true,
            data: { _id: messageId },
            message: 'Message supprimé avec succès',
        });
    };
}

export default new MessageController();
