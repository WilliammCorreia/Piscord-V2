const ServerService = require("../services/ServerService");

class ServerController {

    async create(req, res) {
        try {
            const serverName = req.body.name;
            const token = req.cookies.accessToken;

            const result = await ServerService.create(serverName, token);

            return res.status(201).json({
                success: true,
                data: result,
                message: "Serveur créé."
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    };

    async getUserServers(req, res) {
        try {
            const token = req.cookies.accessToken;

            const result = await ServerService.getUserServers(token);

            return res.status(200).json({
                success: true,
                data: result,
                message: "Liste des serveurs auxquels l'utilisateur appartient."
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    };
}

module.exports = new ServerController();