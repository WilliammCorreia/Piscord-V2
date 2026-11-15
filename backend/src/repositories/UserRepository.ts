import { User, type UserDocument } from '../models/User.ts';

/**
 * Repository pour la gestion des utilisateurs
 * Contient toutes les opérations de base de données liées aux utilisateurs
 */
class UserRepository {

    /**
     * Crée un nouvel utilisateur en base de données
     * @throws Si la création échoue (ex: email déjà pris, contraintes de validation)
     */
    async create(userData: { email: string; hashPassword: string; username: string }): Promise<UserDocument> {
        return await User.create(userData);
    }

    /**
     * Recherche un utilisateur par son email, sans tenir compte de la casse
     * (les comptes créés avant la normalisation peuvent contenir des majuscules)
     * @returns L'utilisateur, hash du mot de passe inclus, ou null
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return await User.findOne({ email }).collation({ locale: 'en', strength: 2 });
    }

    /**
     * Recherche un utilisateur par son ID
     * @returns L'utilisateur sans le hash du mot de passe, ou null
     */
    async findById(userId: string): Promise<UserDocument | null> {
        return await User.findById(userId).select('-hashPassword');
    }

    /** Met à jour la date de dernière connexion */
    async touchLastConnection(userId: string): Promise<void> {
        await User.updateOne({ _id: userId }, { lastConnection: new Date() });
    }

    /** Invalide tous les refresh tokens déjà émis pour cet utilisateur */
    async incrementTokenVersion(userId: string): Promise<void> {
        await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
    }
}

export default new UserRepository();
