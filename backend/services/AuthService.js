require("dotenv").config();
const UserRepository = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Service d'authentification
 * Gère les opérations liées à l'inscription et à la connexion des utilisateurs
 */
class AuthService {

    /**
     * Génère des tokens d'authentification JWT pour un utilisateur
     * Crée un access token (courte durée) et un refresh token (longue durée)
     * 
     * @param {string} email - Email de l'utilisateur pour lequel générer les tokens
     * @param {string} username - Nom d'utilisateur à inclure dans le payload
     * @returns {Promise<Object>} Objet contenant les deux tokens
     * @returns {string} returns.accessToken - Token d'accès valide 15 minutes
     * @returns {string} returns.refreshToken - Token de rafraîchissement valide 7 jours
     */
    async generateTokens(email, username) {
        try {
            const user = await UserRepository.findByEmail(email);

            const payload = {
                userId: user._id,
                email,
                username
            };

            const accessToken = jwt.sign(
                payload, 
                process.env.JWT_SECRET, 
                { expiresIn: '15min' }
            );

            const refreshToken = jwt.sign(
                { user: user._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
            );

            return { accessToken, refreshToken };
        }
        catch (err) {
            throw new Error("Echec lors de la génération du token : ", err.message);
        }
    }

    /**
     * Inscrit un nouvel utilisateur
     * @param {Object} signupData - Données d'inscription
     * @param {string} signupData.email - Email de l'utilisateur
     * @param {string} signupData.password - Mot de passe en clair
     * @param {string} signupData.username - Nom d'utilisateur
     * @returns {Object} Objet avec les données utilisateurs et les tokens
     * @throws {Error} Si l'email est déjà utilisé
     */
    async signup(signupData) {
        try {
            const { email, password, username } = signupData;

            const user = await UserRepository.findByEmail(email);
            if (user) throw new Error("Email déjà utilisé.");

            const hashPassword = await bcrypt.hash(password, 12);

            let newUser = await UserRepository.create({ email, hashPassword, username });
            newUser = {
                email: newUser.email,
                username: newUser.username
            };

            const tokens = await this.generateTokens(email, username);

            return { newUser, tokens };
        }
        catch (err) {
            throw new Error("Echec lors de l'inscription : ", err.message);
        }
    }

    /**
     * Connecte un utilisateur existant
     * @param {Object} signinData - Données de connexion
     * @param {string} signinData.email - Email de l'utilisateur
     * @param {string} signinData.password - Mot de passe en clair
     * @returns {Object} Objet avec les données utilisateurs et les tokens
     * @throws {Error} Si l'email est introuvable
     * @throws {Error} Si le mot de passe est incorrect
     */
    async signin(signinData) {
        try {
            const { email, password } = signinData;

            let user = await UserRepository.findByEmail(email);
            if (!user) throw new Error("Email introuvable.");

            const match = await bcrypt.compare(password, user.hashPassword);
            if (!match) throw new Error("Mot de passe incorrect.");

            user = {
                id: user._id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
                displayStatus: user.displayStatus,
                lastConnection: user.lastConnection
            };
            const tokens = await this.generateTokens(email, user.username);

            return {user, tokens};
        }
        catch (err) {
            throw new Error("Echec lors de l'inscription : ", err.message);
        }
    }

    /**
     * Rafraîchit un token d'accès JWT à partir d'un refresh token valide
     * @param {Object} tokens - Objet contenant le refresh token
     * @param {string} tokens.refreshToken - Refresh token JWT à vérifier
     * @returns {Promise<string|boolean>} Nouvel access token JWT si le refresh token est valide, sinon false
     * @throws {Error} Si le refresh token est invalide ou expiré
     * @throws {Error} Si l'utilisateur associé au refresh token est introuvable
     * @throws {Error} Si une erreur survient lors de la vérification ou de la génération du token
     */
    async refresh(tokens) {
        try {
            let refreshToken = tokens.refreshToken;

            refreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

            if (refreshToken.iat < refreshToken.exp) {
                const user = await UserRepository.findByUserId(refreshToken.user);

                const payload = {
                    userId: user._id,
                    email: user.email,
                    username: user.username
                };
                
                const accessToken = jwt.sign(
                    payload, 
                    process.env.JWT_SECRET,
                    { expiresIn: '15min'}
                );

                return accessToken;
            }
            else {
                return false;
            }
        }
        catch (err) {
            throw new Error("Echec lors du rafraîchissement du token : ", err.message);
        }
    }
}

module.exports = new AuthService();