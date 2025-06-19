const Server = require("../models/Server");

class ServerRepository {

    /**
     * Crée un nouveau serveur
     * @param {String} name - Nom du serveur
     * @param {String} ownerId - ID du propriétaire
     * @returns {Promise<Object>} Serveur créé
     */
    async create(name, ownerId) {
        const server = new Server({ 
            name, 
            ownerId,
            memberIds: [ownerId],
        });
        return await server.save();
    }

    /**
     * Trouve plusieurs serveurs par leurs IDs
     * @param {Array} serverIds - Tableau des IDs de serveurs
     * @returns {Promise<Array>} Liste des serveurs trouvés
     */
    async findServersByIds(serverIds) {
        const servers = await Server.find({ _id: { $in: serverIds } })
            .populate('memberIds', 'username')
            .exec();
        console.log(servers);
        return servers;
    }

    /**
     * Trouve un serveur par son ID
     * @param {String} serverId - ID du serveur
     * @returns {Promise<Object|null>} Serveur trouvé ou null
     */
    async findById(serverId) {
        return await Server.findById(serverId)
            .populate('ownerId', 'username email')
            .populate('memberIds', 'username email')
            .populate('bannedIds', 'username email')
            .exec();
    }

    /**
     * Ajoute un membre à un serveur
     * @param {String} serverId - ID du serveur
     * @param {String} userId - ID de l'utilisateur à ajouter
     * @returns {Promise<Object|null>} Serveur mis à jour ou null
     */
    async addMember(serverId, userId) {
        return await Server.findByIdAndUpdate(
            serverId,
            { 
                $addToSet: { memberIds: userId }
            },
            { 
                new: true
            }
        )
        .populate('ownerId', 'username email')
        .populate('memberIds', 'username email')
        .exec();
    }

    /**
     * Supprime un membre d'un serveur
     * @param {String} serverId - ID du serveur
     * @param {String} userId - ID de l'utilisateur à supprimer
     * @returns {Promise<Object|null>} Serveur mis à jour ou null
     */
    async removeMember(serverId, userId) {
        return await Server.findByIdAndUpdate(
            serverId,
            { 
                $pull: { memberIds: userId }
            },
            { new: true }
        )
        .populate('ownerId', 'username email')
        .populate('memberIds', 'username email')
        .exec();
    }
}

module.exports = new ServerRepository();