const InvitationService = require("../services/InvitationService");

class InvitationController {

    /**
     * Crée une nouvelle invitation
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async create(req, res) {
        try {
            const createdBy = req.user.userId;
            const { serverId, expiredAt, maxUsage } = req.body;

            if (!serverId) {
                return res.status(400).json({
                    success: false,
                    error: "ServerId est requis"
                });
            }

            const invitation = await InvitationService.createInvitation(serverId, createdBy, {
                expiredAt,
                maxUsage
            });

            res.status(201).json({
                success: true,
                data: invitation,
                message: "Invitation créée avec succès"
            });
        } catch (err) {
            if (err.message.includes("introuvable") || err.message.includes("membre du serveur")) {
                return res.status(403).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: `Erreur lors de la création de l'invitation : ${err.message}`
            });
        }
    }

    /**
     * Récupère toutes les invitations d'un serveur
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async getByServerId(req, res) {
        try {
            const { serverId } = req.params;

            const invitations = await InvitationService.getInvitationsByServerId(serverId);

            res.status(200).json({
                success: true,
                data: invitations,
                message: "Invitations récupérées avec succès"
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: `Erreur lors de la récupération des invitations : ${err.message}`
            });
        }
    }

    /**
     * Supprime une invitation
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async delete(req, res) {
        try {
            const userId = req.user.userId;
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({
                    success: false,
                    error: "Code d'invitation requis"
                });
            }

            const deletedInvitation = await InvitationService.deleteInvitation(code, userId);

            res.status(200).json({
                success: true,
                data: deletedInvitation,
                message: "Invitation supprimée avec succès"
            });
        } catch (err) {
            if (err.message.includes("introuvable")) {
                return res.status(404).json({
                    success: false,
                    error: err.message
                });
            }

            if (err.message.includes("autorisation")) {
                return res.status(403).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: `Erreur lors de la suppression de l'invitation : ${err.message}`
            });
        }
    }

    /**
     * Rejoint un serveur via une invitation
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async join(req, res) {
        try {
            const userId = req.user.userId;
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({
                    success: false,
                    error: "Code d'invitation requis"
                });
            }

            const result = await InvitationService.joinByInvitation(code, userId);

            res.status(200).json({
                success: true,
                data: result,
                message: "Vous avez rejoint le serveur avec succès"
            });
        } catch (err) {
            if (err.message.includes("introuvable")) {
                return res.status(404).json({
                    success: false,
                    error: err.message
                });
            }

            if (err.message.includes("active") || err.message.includes("expiré") || 
                err.message.includes("maximum") || err.message.includes("déjà membre")) {
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: `Erreur lors de l'utilisation de l'invitation : ${err.message}`
            });
        }
    }
}

module.exports = new InvitationController();