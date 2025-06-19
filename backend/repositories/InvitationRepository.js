const Invitation = require("../models/Invitation");

class InvitationRepository {

    /**
     * Crée une nouvelle invitation
     * @param {String} code - Code d'invitation unique
     * @param {String} serverId - ID du serveur
     * @param {String} createdBy - ID du créateur
     * @param {Boolean} isActive - État de l'invitation
     * @param {Date} expiredAt - Date d'expiration
     * @param {Number} maxUsage - Nombre maximum d'utilisations
     * @returns {Promise<Object>} Invitation créée
     */
    async create(code, serverId, createdBy, isActive = true, expiredAt = null, maxUsage = null) {
        const invitation = new Invitation({
            code, 
            serverId, 
            createdBy,
            isActive, 
            expiredAt, 
            maxUsage,
            currentUsage: 0
        });
        return await invitation.save();
    }

    /**
     * Trouve une invitation par son code
     * @param {String} code - Code d'invitation
     * @returns {Promise<Object|null>} Invitation trouvée ou null
     */
    async findByCode(code) {
        return await Invitation.findOne({ code })
            .populate('serverId', 'name')
            .populate('createdBy', 'username')
            .exec();
    }

    /**
     * Récupère toutes les invitations d'un serveur
     * @param {String} serverId - ID du serveur
     * @returns {Promise<Array>} Liste des invitations du serveur
     */
    async findByServerId(serverId) {
        return await Invitation.find({ serverId })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Supprime une invitation par son code
     * @param {String} code - Code d'invitation
     * @returns {Promise<Object|null>} Invitation supprimée ou null
     */
    async deleteByCode(code) {
        return await Invitation.findOneAndDelete({ code });
    }

    /**
     * Incrémente le compteur d'usage d'une invitation
     * @param {String} invitationId - ID de l'invitation
     * @returns {Promise<Object|null>} Invitation mise à jour
     */
    async incrementUsage(invitationId) {
        return await Invitation.findByIdAndUpdate(
            invitationId,
            { $inc: { currentUsage: 1 } },
            { new: true }
        );
    }
}

module.exports = new InvitationRepository();