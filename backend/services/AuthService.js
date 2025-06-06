const UserRepository = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");


/**
 * Service d'authentification
 * Gère les opérations liées à l'inscription et à la connexion des utilisateurs
 */
class AuthService {

    /**
     * Inscrit un nouvel utilisateur
     * @param {Object} signupData - Données d'inscription
     * @param {string} signupData.email - Email de l'utilisateur
     * @param {string} signupData.password - Mot de passe en clair
     * @param {string} signupData.username - Nom d'utilisateur
     * @returns {Object} Données de l'utilisateur créé (email, username)
     * @throws {Error} Si l'email est déjà utilisé
     */
    async signup(signupData) {
        const { email, password, username } = signupData;

        const user = await UserRepository.findByEmail(email);
        if (user) throw new Error("Email déjà utilisé.");

        const hashPassword = await bcrypt.hash(password, 12);

        UserRepository.create({ email, hashPassword, username });

        return { email, username };
    }
}

module.exports = new AuthService();