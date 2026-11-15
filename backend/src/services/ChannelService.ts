import ChannelRepository, { type ChannelLean } from '../repositories/ChannelRepository.ts';
import AccessService from './AccessService.ts';

class ChannelService {

    /**
     * Récupère tous les salons d'un serveur (réservé aux membres du serveur)
     */
    async getChannelsByServerId(serverId: string, userId: string): Promise<ChannelLean[]> {
        await AccessService.assertServerMember(serverId, userId);

        return await ChannelRepository.findByServerId(serverId);
    }

    /**
     * Crée un nouveau salon (réservé aux membres du serveur)
     * @param roleIds - IDs des rôles autorisés
     */
    async create(name: string, serverId: string, userId: string, roleIds: string[] = []): Promise<ChannelLean> {
        await AccessService.assertServerMember(serverId, userId);

        return await ChannelRepository.create(name, serverId, roleIds);
    }
}

export default new ChannelService();
