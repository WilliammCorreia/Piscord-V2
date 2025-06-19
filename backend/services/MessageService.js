const MessageRepository = require("../repositories/MessageRepository");

class MessageService {

    /**
     * Créer un nouveau Message et l'enregistre en base de données
     * @param {String} content - Contenu du message
     * @param {String} authorId - ID de l'auteur du message
     * @param {String} referenceId - ID de la référence du message
     * @param {boolean} isDeleted - `true` si le message est supprimé, sinon `false`
     * @returns {Promise<Object>} Une promesse de message
     */
    async create(content, authorId, referenceId, isDeleted = false) {
        try {
            if (!content || !authorId || !referenceId) {
                throw new Error("Content, authorId et referenceId sont requis");
            }

            return await MessageRepository.create(content, authorId, referenceId, isDeleted);
        } catch (err) {
            throw new Error(`Erreur lors de la création du message : ${err.message}`);
        }
    }

    /**
     * Récupère les 50 derniers messages d'une référence avec pagination
     * @param {String} referenceId - ID de la référence
     * @param {Number} skip - Nombre de messages à ignorer pour la pagination
     * @returns {Promise<Array>} Une promesse qui résout un tableau des messages
     */
    async getMessagesByReference(referenceId, skip = 0) {
        try {
            if (!referenceId) {
                throw new Error("ReferenceId est requis");
            }

            return await MessageRepository.findLastMessagesByReference(referenceId, skip);
        } catch (err) {
            throw new Error(`Erreur lors de la récupération des messages : ${err.message}`);
        }
    }

    /**
     * Supprime un message (soft delete) - seul l'auteur peut supprimer son message
     * @param {String} messageId - ID du message à supprimer
     * @param {String} userId - ID de l'utilisateur qui demande la suppression
     * @returns {Promise<Object>} Message supprimé
     */
    async deleteMessage(messageId, userId) {
        try {
            if (!messageId || !userId) {
                throw new Error("MessageId et userId sont requis");
            }

            const message = await MessageRepository.findById(messageId);
            if (!message) {
                throw new Error("Message introuvable");
            }

            if (message.authorId._id.toString() !== userId) {
                throw new Error("Vous ne pouvez supprimer que vos propres messages");
            }

            if (message.isDeleted) {
                throw new Error("Message déjà supprimé");
            }

            const deletedMessage = await MessageRepository.softDelete(messageId);
            
            return deletedMessage;
        } catch (err) {
            throw new Error(`Erreur lors de la suppression du message : ${err.message}`);
        }
    }
}

module.exports = new MessageService();