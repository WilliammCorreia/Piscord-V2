const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");
const ServerRepository = require("../repositories/ServerRepository");

class ServerService {

    /**
     * Crée un nouveau serveur et met à jour la liste des serveurs de l'utilisateur.
     * @param {string} serverName - Le nom du serveur à créer.
     * @param {object} userInfo - Les informations de l'utilisateur créateur (contient userId).
     * @returns {Promise<object>} Un objet contenant le serveur créé et l'utilisateur mis à jour.
     */
    async create(serverName, userInfo) {
        const server = await ServerRepository.create(serverName, userInfo.userId);
        const user = await UserRepository.addServerId(userInfo.userId, server._id);
        
        return { server, user };
    };

    /**
     * Récupère la liste des serveurs auxquels un utilisateur appartient.
     * @param {object} userInfo - Les informations de l'utilisateur (contient userId).
     * @returns {Promise<Array>} Une liste des serveurs auxquels l'utilisateur appartient.
     */
    async getByUserId(userInfo) {
        const serverIds = await UserRepository.findServerIdsByUserId(userInfo.userId);
        const servers = await ServerRepository.findServersByIds(serverIds.serverIds);

        return servers;
    };
}

module.exports = new ServerService();