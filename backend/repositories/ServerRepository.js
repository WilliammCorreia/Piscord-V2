const Server = require("../models/Server");

class ServerRepository {

    async create(name, ownerId) {
        const server = new Server({ 
            name, 
            ownerId,
            memberIds: [ownerId],
        });
        return await server.save();
    }

    async findServersByIds(serverIds) {
        const servers = await Server.find({ _id: { $in: serverIds } });
        console.log(servers);
        return servers;
    }
}

module.exports = new ServerRepository();