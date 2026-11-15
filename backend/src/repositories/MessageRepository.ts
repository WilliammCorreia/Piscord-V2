import type { Types } from 'mongoose';
import { Message, type IMessage, type PopulatedMessage } from '../models/Message.ts';

export type MessageLean = IMessage & { _id: Types.ObjectId };

class MessageRepository {

    /**
     * Crée un nouveau message et le renvoie avec son auteur peuplé
     */
    async create(content: string, authorId: string, referenceId: string): Promise<PopulatedMessage> {
        const message = await Message.create({ content, authorId, referenceId });
        await message.populate('authorId', 'username');
        return message.toObject() as unknown as PopulatedMessage;
    }

    /**
     * Récupère une page de messages non supprimés, du plus récent au plus ancien
     * @param referenceId - ID de la référence (salon, message privé)
     * @param limit - Nombre maximum de messages à renvoyer
     * @param before - Curseur : ne renvoie que les messages antérieurs à cet ID
     */
    async findPageByReference(referenceId: string, limit: number, before?: string): Promise<PopulatedMessage[]> {
        return await Message
            .find({
                referenceId,
                isDeleted: false,
                ...(before ? { _id: { $lt: before } } : {}),
            })
            .sort({ _id: -1 })
            .limit(limit)
            .populate('authorId', 'username')
            .lean<PopulatedMessage[]>();
    }

    /**
     * Récupère un message par son ID, sans peupler son auteur
     */
    async findById(messageId: string): Promise<MessageLean | null> {
        return await Message.findById(messageId).lean<MessageLean>();
    }

    /**
     * Supprime un message en passant isDeleted à true
     */
    async softDelete(messageId: string): Promise<void> {
        await Message.updateOne({ _id: messageId }, { isDeleted: true });
    }
}

export default new MessageRepository();
