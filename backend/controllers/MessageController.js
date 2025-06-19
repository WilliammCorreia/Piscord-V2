const MessageService = require("../services/MessageService");

class MessageController {

    /**
     * Créer un nouveau Message et l'enregistre en base de données
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async create(req, res) {
        try {
            const authorId = req.user.userId;
            const { content, referenceId } = req.body;

            const message = await MessageService.create(content, authorId, referenceId, false);

            res.status(201).json({
                success: true,
                data: message,
                message: "Message créé avec succès"
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: `Erreur lors de la création du message : ${err.message}`
            });
        }
    }

    /**
     * Récupère les 50 derniers messages d'une référence avec pagination
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async getMessagesByReference(req, res) {
        try {
            const { referenceId } = req.params;
            const page = parseInt(req.query.page) || 0;
            const skip = page * 50;

            const messages = await MessageService.getMessagesByReference(referenceId, skip);

            res.status(200).json({
                success: true,
                data: messages,
                message: "Messages récupérés avec succès"
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: `Erreur lors de la récupération des messages : ${err.message}`
            });
        }
    }

    /**
     * Supprime un message (soft delete)
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const userId = req.user.userId;

            const deletedMessage = await MessageService.deleteMessage(messageId, userId);

            res.status(200).json({
                success: true,
                data: deletedMessage,
                message: "Message supprimé avec succès"
            });
        } catch (err) {
            if (err.message.includes("introuvable")) {
                return res.status(404).json({
                    success: false,
                    error: err.message
                });
            }
            
            if (err.message.includes("ne pouvez supprimer") || err.message.includes("déjà supprimé")) {
                return res.status(403).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: `Erreur lors de la suppression du message : ${err.message}`
            });
        }
    }
}

module.exports = new MessageController();