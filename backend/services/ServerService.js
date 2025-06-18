const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");
const ServerRepository = require("../repositories/ServerRepository");

class ServerService {

    async create(serverName, userInfo) {
        const server = await ServerRepository.create(serverName, userInfo.userId);
        const user = await UserRepository.addServerId(userInfo.userId, server._id);
        
        return { server, user };
    };

    async getUserServers(userInfo) {
        const serverIds = await UserRepository.findServerIdsByUserId(userInfo.userId);
        const servers = await ServerRepository.findServersByIds(serverIds[0].serverIds);

        return servers;
    };
}

module.exports = new ServerService();