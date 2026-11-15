import type { Types } from 'mongoose';
import { Server, type IServer } from '../models/Server.ts';

export type ServerLean = IServer & { _id: Types.ObjectId };

export interface ServerMember {
    _id: Types.ObjectId;
    username: string;
}

/** Serveur dont les membres ont été peuplés (username uniquement, jamais l'email) */
export type ServerWithMembers = Omit<ServerLean, 'memberIds'> & { memberIds: ServerMember[] };

class ServerRepository {

    /**
     * Crée un nouveau serveur dont le propriétaire est le premier membre
     */
    async create(name: string, ownerId: string): Promise<ServerLean> {
        const server = await Server.create({ name, ownerId, memberIds: [ownerId] });
        return server.toObject();
    }

    /**
     * Trouve un serveur par son ID, sans peupler ses références
     * (c'est la forme utilisée pour les contrôles d'accès)
     */
    async findById(serverId: string | Types.ObjectId): Promise<ServerLean | null> {
        return await Server.findById(serverId).lean<ServerLean>();
    }

    /**
     * Trouve un serveur par son ID avec la liste de ses membres
     */
    async findByIdWithMembers(serverId: string | Types.ObjectId): Promise<ServerWithMembers | null> {
        return await Server.findById(serverId)
            .populate('memberIds', 'username')
            .lean<ServerWithMembers>();
    }

    /**
     * Récupère les serveurs dont un utilisateur est membre
     */
    async findByMember(userId: string): Promise<ServerWithMembers[]> {
        return await Server.find({ memberIds: userId })
            .sort({ createdAt: 1 })
            .populate('memberIds', 'username')
            .lean<ServerWithMembers[]>();
    }

    /**
     * Récupère les IDs des serveurs dont un utilisateur est membre
     */
    async findIdsByMember(userId: string): Promise<string[]> {
        const servers = await Server.find({ memberIds: userId }).select('_id').lean<{ _id: Types.ObjectId }[]>();
        return servers.map((server) => server._id.toString());
    }

    /**
     * Ajoute un membre à un serveur ($addToSet : sans effet s'il l'est déjà)
     */
    async addMember(serverId: string | Types.ObjectId, userId: string): Promise<ServerWithMembers | null> {
        return await Server.findByIdAndUpdate(
            serverId,
            { $addToSet: { memberIds: userId } },
            { new: true }
        )
            .populate('memberIds', 'username')
            .lean<ServerWithMembers>();
    }

    /**
     * Supprime un membre d'un serveur
     */
    async removeMember(serverId: string | Types.ObjectId, userId: string): Promise<ServerWithMembers | null> {
        return await Server.findByIdAndUpdate(
            serverId,
            { $pull: { memberIds: userId } },
            { new: true }
        )
            .populate('memberIds', 'username')
            .lean<ServerWithMembers>();
    }
}

export default new ServerRepository();
