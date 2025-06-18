const Channel = require("../models/Channel");

class ChannelRepository {

    async create(name, serverId, roleIds) {
        const channel = new Channel({ name, serverId, roleIds });
        return await channel.save();
    }

    /**
     * Récupère tous les salons associés à un serveur
     * @param {string} serverId - ID du serveur
     * @returns {Promise<Array>} Liste des channels du serveur
     */
    async findByServerId(serverId) {
        return await Channel.find({ serverId });
    }

    /**
     * Récupère un salon par son ID
     * @param {string} channelId - ID du salon
     * @returns {Promise<Object|null>} salon trouvé ou null
     */
    async findById(channelId) {
        return await Channel.findById(channelId);
    }

    /**
     * Récupère tous les salons
     * @returns {Promise<Array>} Liste de tous les salons
     */
    async findAll() {
        return await Channel.find();
    }
}

module.exports = new ChannelRepository();