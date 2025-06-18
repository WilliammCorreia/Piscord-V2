const ChannelService = require("../services/ChannelService");

class ChannelController {

    /**
     * Récupère tous les salons d'un serveur
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async getByServerId(req, res) {
        try {
            const { serverId } = req.params;
            
            const channels = await ChannelService.getChannelsByServerId(serverId);
            
            res.status(200).json({
                success: true,
                data: channels,
                message: "Salons récupérés avec succès"
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * Crée un nouveau salon
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     */
    async create(req, res) {
        try {
            const { name, serverId, roleIds } = req.body;
            
            const channel = await ChannelService.create(name, serverId, roleIds);
            
            res.status(201).json({
                success: true,
                data: channel,
                message: "Salon créé avec succès"
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
}

module.exports = new ChannelController();