const ServerService = require("../services/ServerService");

class ServerController {

    /**
     * Crée un nouveau serveur.
     * @param {object} req - L'objet requête Express.
     * @param {object} res - L'objet réponse Express.
     * @returns {Promise<object>} Une réponse JSON contenant le succès, les données (serveur et utilisateur), et un message.
     */
    async create(req, res) {
        try {
            const serverName = req.body.name;
            const user = req.user;

            const result = await ServerService.create(serverName, user);

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

    /**
     * Récupère la liste des serveurs auxquels un utilisateur appartient.
     * @param {object} req - L'objet requête Express.
     * @param {object} res - L'objet réponse Express.
     * @returns {Promise<object>} Une réponse JSON contenant le succès, les données (liste des serveurs), et un message.
     */
    async getByUserId(req, res) {
        try {
            const userInfo = req.user;

            const result = await ServerService.getByUserId(userInfo);

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