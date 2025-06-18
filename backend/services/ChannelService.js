const ChannelRepository = require("../repositories/ChannelRepository");

class ChannelService {

    /**
     * Récupère tous les salons d'un serveur spécifique
     * @param {string} serverId - ID du serveur
     * @returns {Promise<Array>} Liste des salons du serveur
     */
    async getChannelsByServerId(serverId) {
        try {
            return await ChannelRepository.findByServerId(serverId);
        }
        catch (err) {
            throw new Error(`Erreur lors de la récupération des salons : ${err.message}`);
        }
    }

    /**
     * Crée un nouveau salon
     * @param {string} name - Nom du salon
     * @param {string} serverId - ID du serveur
     * @param {Array} roleIds - IDs des rôles autorisés
     * @returns {Promise<Object>} Channel créé
     */
    async create(name, serverId, roleIds = []) {
        try {
            return await ChannelRepository.create(name, serverId, roleIds);
        }
        catch (err) {
            throw new Error(`Erreur lors de la création du salon : ${err.message}`);
        }
    }
}

module.exports = new ChannelService();