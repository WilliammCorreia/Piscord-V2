import { NotFoundError } from '../errors/AppError.ts';
import ServerRepository, { type ServerLean, type ServerMember, type ServerWithMembers } from '../repositories/ServerRepository.ts';
import { addUserToServer } from '../socket/index.ts';
import type { AuthUser } from '../types/auth.ts';
import AccessService from './AccessService.ts';
import PresenceService from './PresenceService.ts';

export type ServerMemberWithPresence = ServerMember & { online: boolean };

export type ServerWithPresence = Omit<ServerWithMembers, 'memberIds'> & { memberIds: ServerMemberWithPresence[] };

class ServerService {

    /**
     * Crée un nouveau serveur dont l'utilisateur est propriétaire et premier membre
     */
    async create(name: string, user: AuthUser): Promise<ServerLean> {
        const server = await ServerRepository.create(name, user.userId);
        addUserToServer(user.userId, user.username, server._id.toString());

        return server;
    }

    /**
     * Récupère la liste des serveurs auxquels un utilisateur appartient
     */
    async getByUserId(userId: string): Promise<ServerWithMembers[]> {
        return await ServerRepository.findByMember(userId);
    }

    /**
     * Récupère un serveur et ses membres, avec leur statut de connexion
     * (réservé aux membres du serveur)
     */
    async getById(serverId: string, userId: string): Promise<ServerWithPresence> {
        await AccessService.assertServerMember(serverId, userId);

        const server = await ServerRepository.findByIdWithMembers(serverId);
        if (!server) {
            throw new NotFoundError('Serveur introuvable', 'SERVER_NOT_FOUND');
        }

        return {
            ...server,
            memberIds: server.memberIds.map((member) => ({
                ...member,
                online: PresenceService.isOnline(member._id.toString()),
            })),
        };
    }
}

export default new ServerService();
