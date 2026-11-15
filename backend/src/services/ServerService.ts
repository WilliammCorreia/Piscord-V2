import { NotFoundError } from '../errors/AppError.ts';
import ServerRepository, { type ServerLean, type ServerWithMembers } from '../repositories/ServerRepository.ts';
import AccessService from './AccessService.ts';

class ServerService {

    /**
     * Crée un nouveau serveur dont l'utilisateur est propriétaire et premier membre
     */
    async create(name: string, userId: string): Promise<ServerLean> {
        return await ServerRepository.create(name, userId);
    }

    /**
     * Récupère la liste des serveurs auxquels un utilisateur appartient
     */
    async getByUserId(userId: string): Promise<ServerWithMembers[]> {
        return await ServerRepository.findByMember(userId);
    }

    /**
     * Récupère un serveur et ses membres (réservé aux membres du serveur)
     */
    async getById(serverId: string, userId: string): Promise<ServerWithMembers> {
        await AccessService.assertServerMember(serverId, userId);

        const server = await ServerRepository.findByIdWithMembers(serverId);
        if (!server) {
            throw new NotFoundError('Serveur introuvable', 'SERVER_NOT_FOUND');
        }

        return server;
    }
}

export default new ServerService();
