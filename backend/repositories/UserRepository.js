const User = require("../models/User");

/**
 * Repository pour la gestion des utilisateurs
 * Contient toutes les opérations de base de données liées aux utilisateurs
 */
class UserRepository {

    /**
     * Crée un nouvel utilisateur en base de données
     * @param {Object} userData - Données de l'utilisateur à créer
     * @param {string} userData.email - Email de l'utilisateur
     * @param {string} userData.hashPassword - Mot de passe haché
     * @param {string} userData.username - Nom d'utilisateur
     * @returns {Promise<Object>} L'utilisateur créé avec son ID
     * @throws {Error} Si la création échoue (ex: contraintes de validation)
     */
    async create(userData) {
        const user = new User(userData);
        return await user.save();
    }

    /**
     * Recherche un utilisateur par son email
     * @param {string} email - Email de l'utilisateur à rechercher
     * @returns {Promise<Object|null>} L'utilisateur trouvé ou null si aucun résultat
     */
    async findByEmail(email) {
        const user = await User.findOne({ email });
        return user;
    }

    /**
     * Recherche un utilisateur par son ID
     * @param {string} userId - ID de l'utilisateur à rechercher
     * @returns {Promise<Object|null>} L'utilisateur trouvé ou null si aucun résultat
     */
    async findByUserId(userId) {
        const user = await User.findOne({ _id: userId });
        return user;
    }

    async addServerId(userId, serverId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { serverIds: serverId }},
            { new: true }
        );
        return user;
    }

    async findServerIdsByUserId(userId) {
        const user = await User.findOne({ _id: userId }, 'serverIds');
        return user;
    }
}

module.exports = new UserRepository();