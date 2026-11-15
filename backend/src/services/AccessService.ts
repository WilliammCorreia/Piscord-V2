import { ForbiddenError, NotFoundError } from '../errors/AppError.ts';
import ChannelRepository, { type ChannelLean } from '../repositories/ChannelRepository.ts';
import ServerRepository, { type ServerLean } from '../repositories/ServerRepository.ts';

/**
 * Contrôles d'accès partagés par l'API HTTP et par Socket.io.
 * Être connecté ne suffit pas : chaque ressource vérifie l'appartenance au serveur.
 */
class AccessService {

    /**
     * Vérifie qu'un utilisateur est membre d'un serveur
     * @returns Le serveur, pour éviter une seconde requête à l'appelant
     * @throws {NotFoundError} Si le serveur n'existe pas
     * @throws {ForbiddenError} Si l'utilisateur n'en est pas membre
     */
    async assertServerMember(serverId: string, userId: string): Promise<ServerLean> {
        const server = await ServerRepository.findById(serverId);
        if (!server) {
            throw new NotFoundError('Serveur introuvable', 'SERVER_NOT_FOUND');
        }

        if (!server.memberIds.some((memberId) => memberId.equals(userId))) {
            throw new ForbiddenError("Vous n'êtes pas membre de ce serveur", 'NOT_A_MEMBER');
        }

        return server;
    }

    /**
     * Vérifie qu'un utilisateur a accès à un salon (il doit être membre du serveur du salon)
     * @returns Le salon
     * @throws {NotFoundError} Si le salon n'existe pas
     * @throws {ForbiddenError} Si l'utilisateur n'est pas membre du serveur
     */
    async assertChannelAccess(channelId: string, userId: string): Promise<ChannelLean> {
        const channel = await ChannelRepository.findById(channelId);
        if (!channel) {
            throw new NotFoundError('Salon introuvable', 'CHANNEL_NOT_FOUND');
        }

        await this.assertServerMember(channel.serverId, userId);

        return channel;
    }
}

export default new AccessService();
