import type { ChannelType } from '../models/Channel.ts';
import ChannelRepository, { type ChannelLean } from '../repositories/ChannelRepository.ts';
import AccessService from './AccessService.ts';
import VoiceStateService, { type VoiceParticipant } from './VoiceStateService.ts';

/** Salon tel qu'il est renvoyé au client : un salon vocal indique qui s'y trouve */
export type ChannelWithVoiceState = ChannelLean & { participants?: VoiceParticipant[] };

class ChannelService {

    /**
     * Récupère tous les salons d'un serveur (réservé aux membres du serveur)
     */
    async getChannelsByServerId(serverId: string, userId: string): Promise<ChannelWithVoiceState[]> {
        await AccessService.assertServerMember(serverId, userId);

        const channels = await ChannelRepository.findByServerId(serverId);

        return channels.map((channel) =>
            channel.type === 'voice'
                ? { ...channel, participants: VoiceStateService.participants(channel._id.toString()) }
                : channel
        );
    }

    /**
     * Crée un nouveau salon, textuel ou vocal (réservé aux membres du serveur)
     * @param roleIds - IDs des rôles autorisés
     */
    async create(
        name: string,
        serverId: string,
        userId: string,
        options: { type?: ChannelType; roleIds?: string[] } = {}
    ): Promise<ChannelLean> {
        await AccessService.assertServerMember(serverId, userId);

        return await ChannelRepository.create(name, serverId, options.type ?? 'text', options.roleIds ?? []);
    }
}

export default new ChannelService();
