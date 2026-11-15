/** Participant d'un salon vocal, identifié par son socket (un même utilisateur peut avoir deux onglets) */
export interface VoicePeer {
    socketId: string;
    userId: string;
    username: string;
}

/** Ce que les autres membres du serveur voient d'un participant */
export interface VoiceParticipant {
    userId: string;
    username: string;
}

/**
 * En maillage pair-à-pair chaque participant envoie son audio à tous les autres :
 * au-delà de quelques personnes, la bande passante de chacun ne suit plus.
 */
export const MAX_VOICE_PEERS = 8;

/**
 * Occupation des salons vocaux, en mémoire.
 * Le serveur ne transporte aucun son : il sait seulement qui est dans quel salon,
 * pour relayer la signalisation WebRTC entre les bons sockets.
 */
class VoiceStateService {
    private readonly channels = new Map<string, Map<string, VoicePeer>>();
    private readonly channelBySocket = new Map<string, string>();

    /** Salon vocal dans lequel se trouve un socket, s'il y en a un */
    channelOf(socketId: string): string | undefined {
        return this.channelBySocket.get(socketId);
    }

    peers(channelId: string): VoicePeer[] {
        return Array.from(this.channels.get(channelId)?.values() ?? []);
    }

    /** Participants d'un salon, sans doublon quand un utilisateur y est avec plusieurs onglets */
    participants(channelId: string): VoiceParticipant[] {
        const byUser = new Map<string, VoiceParticipant>();
        for (const peer of this.peers(channelId)) {
            byUser.set(peer.userId, { userId: peer.userId, username: peer.username });
        }
        return Array.from(byUser.values());
    }

    isFull(channelId: string): boolean {
        return this.peers(channelId).length >= MAX_VOICE_PEERS;
    }

    join(channelId: string, peer: VoicePeer): void {
        let channel = this.channels.get(channelId);
        if (!channel) {
            channel = new Map();
            this.channels.set(channelId, channel);
        }
        channel.set(peer.socketId, peer);
        this.channelBySocket.set(peer.socketId, channelId);
    }

    /**
     * Retire un socket de son salon vocal
     * @returns L'ID du salon quitté, ou undefined s'il n'était dans aucun
     */
    leave(socketId: string): string | undefined {
        const channelId = this.channelBySocket.get(socketId);
        if (!channelId) return undefined;

        this.channelBySocket.delete(socketId);

        const channel = this.channels.get(channelId);
        channel?.delete(socketId);
        if (channel?.size === 0) {
            this.channels.delete(channelId);
        }

        return channelId;
    }
}

export default new VoiceStateService();
