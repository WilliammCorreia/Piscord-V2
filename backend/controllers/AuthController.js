const AuthService = require("../services/AuthService");

/**
 * Contrôleur d'authentification
 * Gère les requêtes HTTP liées à l'authentification des utilisateurs
 */
class AuthController {

    /**
     * Gère l'inscription d'un nouvel utilisateur
     * @param {Object} req - Objet de requête Express
     * @param {Object} req.body - Corps de la requête contenant les données d'inscription
     * @param {string} req.body.email - Email de l'utilisateur
     * @param {string} req.body.password - Mot de passe en clair
     * @param {string} req.body.username - Nom d'utilisateur
     * @param {Object} res - Objet de réponse Express
     * @returns {Promise<void>} Réponse JSON avec le statut de l'inscription
     */
    async signup(req, res) {
        try {
            const signupData = req.body;
            
            const newUser = await AuthService.signup(signupData);

            return res.status(201).json({ 
                success: true,
                data: newUser,
                message: "Utilisateur créé." 
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                erreur: "Erreur lors de l'inscription."
            });
        }
    };
}

module.exports = new AuthController();