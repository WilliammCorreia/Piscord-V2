import type { Types } from 'mongoose';
import { Channel, type IChannel } from '../models/Channel.ts';

export type ChannelLean = IChannel & { _id: Types.ObjectId };

class ChannelRepository {

    async create(name: string, serverId: string, roleIds: string[]): Promise<ChannelLean> {
        const channel = await Channel.create({ name, serverId, roleIds });
        return channel.toObject();
    }

    /**
     * Récupère tous les salons associés à un serveur
     */
    async findByServerId(serverId: string): Promise<ChannelLean[]> {
        return await Channel.find({ serverId }).sort({ createdAt: 1 }).lean<ChannelLean[]>();
    }

    /**
     * Récupère un salon par son ID
     */
    async findById(channelId: string): Promise<ChannelLean | null> {
        return await Channel.findById(channelId).lean<ChannelLean>();
    }
}

export default new ChannelRepository();
