const InvitationRepository = require("../repositories/InvitationRepository");
const ServerRepository = require("../repositories/ServerRepository");
const crypto = require("crypto");
const UserRepository = require("../repositories/UserRepository");

class InvitationService {

    /**
     * Génère un code d'invitation unique
     * @returns {String} Code d'invitation
     */
    generateInvitationCode() {
        return crypto.randomBytes(4).toString('hex').toUpperCase(); // Ex: A1B2C3D4
    }

    /**
     * Indique si un utilisateur est membre du serveur
     * @param {Object} server - Objet contenant les informations sur le serveur nottament la liste de membres
     * @param {String} userId - ID de l'utilisateur à vérifier
     * @returns {boolean} Retourne `true` si l'utilisateur appartient au serveur, sinon `false`
     */
    checkIfMember(server, userId) {
        return server.memberIds.some(member => member._id.toString() === userId);
    }

    /**
     * Crée une nouvelle invitation pour un serveur
     * @param {String} serverId - ID du serveur
     * @param {String} createdBy - ID de l'utilisateur créateur
     * @param {Object} options - Options d'invitation (expiredAt, maxUsage)
     * @returns {Promise<Object>} Invitation créée
     */
    async createInvitation(serverId, createdBy, options = {}) {
        try {
            const server = await ServerRepository.findById(serverId);
            if (!server) {
                throw new Error("Serveur introuvable");
            }

            if (!this.checkIfMember(server, createdBy)) {
                throw new Error("Vous devez être membre du serveur pour créer une invitation");
            }
            
            let code;
            let attempts = 0;
            do {
                code = this.generateInvitationCode();
                const existing = await InvitationRepository.findByCode(code);
                if (!existing) break;
                attempts++;
            } while (attempts < 10);

            if (attempts >= 10) {
                throw new Error("Impossible de générer un code unique");
            }

            const { expiredAt, maxUsage } = options;
            let expiration = null;
            
            if (expiredAt) {
                expiration = new Date(expiredAt);
                if (expiration <= new Date()) {
                    throw new Error("La date d'expiration doit être dans le futur");
                }
            }

            return await InvitationRepository.create(
                code, 
                serverId, 
                createdBy, 
                true, 
                expiration, 
                maxUsage
            );
        } catch (err) {
            throw new Error(`Erreur lors de la création de l'invitation : ${err.message}`);
        }
    }

    /**
     * Récupère toutes les invitations actives d'un serveur
     * @param {String} serverId - ID du serveur
     * @returns {Promise<Array>} Liste des invitations
     */
    async getInvitationsByServerId(serverId) {
        try {
            return await InvitationRepository.findByServerId(serverId);
        } catch (err) {
            throw new Error(`Erreur lors de la récupération des invitations : ${err.message}`);
        }
    }

    /**
     * Supprime une invitation
     * @param {String} code - Code d'invitation
     * @param {String} userId - ID de l'utilisateur demandant la suppression
     * @returns {Promise<Object>} Invitation supprimée
     */
    async deleteInvitation(code, userId) {
        try {
            const invitation = await InvitationRepository.findByCode(code);
            if (!invitation) {
                throw new Error("Invitation introuvable");
            }

            const server = await ServerRepository.findById(invitation.serverId._id);
            if (invitation.createdBy._id.toString() !== userId && server.ownerId.toString() !== userId) {
                throw new Error("Vous n'avez pas l'autorisation de supprimer cette invitation");
            }

            return await InvitationRepository.deleteByCode(code);
        } catch (err) {
            throw new Error(`Erreur lors de la suppression de l'invitation : ${err.message}`);
        }
    }

    /**
     * Rejoint un serveur via une invitation
     * @param {String} code - Code d'invitation
     * @param {String} userId - ID de l'utilisateur
     * @returns {Promise<Object>} Résultat du join
     */
    async joinByInvitation(code, userId) {
        try {
            const invitation = await InvitationRepository.findByCode(code);
            if (!invitation) {
                throw new Error("Invitation introuvable");
            }

            if (!invitation.isActive) {
                throw new Error("Cette invitation n'est plus active");
            }

            if (invitation.expiredAt && new Date() > invitation.expiredAt) {
                throw new Error("Cette invitation a expiré");
            }

            if (invitation.maxUsage && invitation.currentUsage >= invitation.maxUsage) {
                throw new Error("Cette invitation a atteint son nombre maximum d'utilisations");
            }

            const server = await ServerRepository.findById(invitation.serverId._id);
            if (this.checkIfMember(server, userId)) {
                throw new Error("Vous êtes déjà membre de ce serveur");
            }

            const updatedUser = await UserRepository.addServerId(userId, server._id);
            const updatedServer = await ServerRepository.addMember(server._id, userId);

            await InvitationRepository.incrementUsage(invitation._id);

            return {
                user: updatedUser,
                server: updatedServer,
                invitation: invitation
            };
        } catch (err) {
            throw new Error(`Erreur lors de l'utilisation de l'invitation : ${err.message}`);
        }
    }
}

module.exports = new InvitationService();