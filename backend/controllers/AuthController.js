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
            
            const result = await AuthService.signup(signupData);

            res.cookie("accessToken", result.tokens.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });

            res.cookie("refreshToken", result.tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });

            return res.status(201).json({ 
                success: true,
                data: result.newUser,
                message: "Utilisateur créé." 
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                erreur: err.message
            });
        }
    };

    /**
     * Gère la connexion d'un utilisateur existant
     * @param {Object} req - Objet de requête Express
     * @param {Object} req.body - Corps de la requête contenant les données de connexion
     * @param {string} req.body.email - Email de l'utilisateur
     * @param {string} req.body.password - Mot de passe en clair
     * @param {Object} res - Objet de réponse Express
     * @returns {Promise<void>} Réponse JSON avec le statut de la connexion et les tokens
     */
    async signin(req, res) {
        try {
            const signinData = req.body;
            
            const result = await AuthService.signin(signinData);

            res.cookie("accessToken", result.tokens.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });

            res.cookie("refreshToken", result.tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });

            return res.status(200).json({ 
                success: true,
                data: result.user,
                message: "Utilisateur connecté." 
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                erreur: err.message
            });
        }
    };

    /**
     * Rafraîchit le token d'accès JWT en utilisant le refresh token
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     * @returns {Promise<void>} Réponse JSON avec le nouveau token ou une erreur
     */
    async refresh(req, res) {
        try {
            const tokens = req.cookies;

            const result = await AuthService.refresh(tokens);

            if (result) {
                res.clearCookie("accessToken");
                res.cookie("accessToken", result);

                return res.status(200).json({
                    success: true,
                    message: "Token rafraîchit"
                })
            }
            else {
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");

                return res.status(401).json({
                    success: false,
                    message: "Reconnexion requise"
                })
            }
        }
        catch (err) {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            return res.status(500).json({
                success: false,
                erreur: err.message
            });
        }
    };

    /**
     * Déconnecte l'utilisateur en supprimant les cookies d'authentification
     * @param {Object} req - Objet de requête Express
     * @param {Object} res - Objet de réponse Express
     * @returns {Promise<void>} Réponse HTTP 204 No Content
     */
    disconnect(req, res) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(204).json({
            success: true,
            message: "Utilisateur bien déconnecté"
        });
    }
}

module.exports = new AuthController();