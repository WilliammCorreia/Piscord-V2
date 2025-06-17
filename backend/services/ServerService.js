const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");
const ServerRepository = require("../repositories/ServerRepository");

class ServerService {

    async create(serverName, token) {
        const userInfo = jwt.verify(token, process.env.JWT_SECRET);

        const server = await ServerRepository.create(serverName, userInfo.userId);
        const user = await UserRepository.addServerId(userInfo.userId, server._id);
        return { server, user };
    };

    async getUserServers(token) {
        const userInfo = jwt.verify(token, process.env.JWT_SECRET);

        const serverIds = await UserRepository.findServerIdsByUserId(userInfo.userId);
        const servers = await ServerRepository.findServersByIds(serverIds[0].serverIds);
        console.log(serverIds[0].serverIds); 

        return servers;
    };
}

module.exports = new ServerService();