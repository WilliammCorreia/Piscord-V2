const Message = require("../models/Message");

class MessageRepository {

    /**
     * Créer un nouveau Message et l'enregistre en base de données
     * @param {String} content - Contenu du message
     * @param {String} authorId -  ID de l'auteur du message
     * @param {String} referenceId - ID de la référence du message
     * @param {boolean} isDeleted - `true` si le message est supprimé, sinon `false`
     * @returns {Promise<Object>} Une promesse de message
     */
    async create(content, authorId, referenceId, isDeleted = false) {
        const message = new Message({content, authorId, referenceId, isDeleted});
        return await message.save();
    }

    /**
    * Récupère les 50 derniers messages d'une référence donnée avec pagination
    * @param {String} referenceId - ID de la référence (salon, message privé)
    * @param {number} skip - Nombre de messages à ignorer pour la pagination (défaut: 0)
    * @returns {Promise<Array>} Une promesse qui résout un tableau des messages trouvés
    */
    async findLastMessagesByReference(referenceId, skip = 0) {
        return await Message
            .find({ referenceId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(50)
            .populate('authorId', 'username')
            .exec();
    }

    /**
     * Supprime un message en changeant isDeleted à true
     * @param {String} messageId - ID du message à supprimer
     * @returns {Promise<Object|null>} Message mis à jour ou null si non trouvé
     */
    async softDelete(messageId) {
        return await Message.findByIdAndUpdate(
            messageId,
            { isDeleted: true },
            { new: true }
        );
    }

    /**
     * Récupère un message par son ID
     * @param {String} messageId - ID du message
     * @returns {Promise<Object|null>} Message trouvé ou null
     */
    async findById(messageId) {
        return await Message.findById(messageId)
            .populate('authorId', 'username')
            .exec();
    }
}

module.exports = new MessageRepository();