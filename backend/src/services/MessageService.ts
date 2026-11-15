import { ForbiddenError, NotFoundError } from '../errors/AppError.ts';
import type { PopulatedMessage } from '../models/Message.ts';
import MessageRepository from '../repositories/MessageRepository.ts';
import { emitMessage, emitMessageDeleted } from '../socket/index.ts';
import AccessService from './AccessService.ts';

export const DEFAULT_PAGE_SIZE = 50;

export interface MessagePage {
    /** Messages dans l'ordre chronologique (le plus ancien en premier) */
    messages: PopulatedMessage[];
    /** true s'il reste des messages plus anciens à charger */
    hasMore: boolean;
}

class MessageService {

    /**
     * Enregistre un message puis le diffuse aux membres connectés au salon.
     * C'est le serveur qui émet, après persistance : ce que reçoivent les autres
     * est exactement ce qui est en base, avec le véritable auteur.
     * @param referenceId - ID d'un salon, ou identifiant d'une conversation privée
     */
    async create(content: string, authorId: string, referenceId: string): Promise<PopulatedMessage> {
        const reference = await AccessService.assertReferenceAccess(referenceId, authorId);

        const message = await MessageRepository.create(content, authorId, referenceId);

        // Message privé : les deux participants sont prévenus, conversation ouverte ou non
        emitMessage(referenceId, message, reference.kind === 'conversation' ? reference.participantIds : []);

        return message;
    }

    /**
     * Récupère une page de messages d'un salon ou d'une conversation privée
     * @param before - Curseur : ID du plus ancien message déjà chargé
     */
    async getMessagesByReference(
        referenceId: string,
        userId: string,
        options: { before?: string; limit?: number } = {}
    ): Promise<MessagePage> {
        await AccessService.assertReferenceAccess(referenceId, userId);

        const limit = options.limit ?? DEFAULT_PAGE_SIZE;

        // On demande un message de plus pour savoir s'il en reste d'autres
        const newestFirst = await MessageRepository.findPageByReference(referenceId, limit + 1, options.before);
        const hasMore = newestFirst.length > limit;

        return {
            messages: newestFirst.slice(0, limit).reverse(),
            hasMore,
        };
    }

    /**
     * Supprime un message (soft delete) - seul l'auteur peut supprimer son message
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        const message = await MessageRepository.findById(messageId);
        if (!message || message.isDeleted) {
            throw new NotFoundError('Message introuvable', 'MESSAGE_NOT_FOUND');
        }

        if (!message.authorId.equals(userId)) {
            throw new ForbiddenError('Vous ne pouvez supprimer que vos propres messages', 'NOT_THE_AUTHOR');
        }

        await MessageRepository.softDelete(messageId);
        emitMessageDeleted(message.referenceId, messageId);
    }
}

export default new MessageService();
