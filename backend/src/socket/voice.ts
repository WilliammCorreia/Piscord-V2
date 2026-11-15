import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.ts';
import AccessService from '../services/AccessService.ts';
import VoiceStateService, { type VoicePeer } from '../services/VoiceStateService.ts';
import { type PiscordServer, type PiscordSocket, type VoiceJoinAck, serverRoom, voiceRoom } from './types.ts';

/** Une offre SDP pèse quelques kilo-octets : au-delà, ce n'est pas de la signalisation */
const MAX_SIGNAL_BYTES = 64 * 1024;

/** Serveur auquel appartient chaque salon vocal occupé (évite une requête en base à chaque départ) */
const serverIdByChannel = new Map<string, string>();

/**
 * Salons vocaux : le son circule directement entre les navigateurs (WebRTC).
 * Le serveur se limite à dire qui est dans le salon et à relayer la signalisation
 * entre deux participants d'un même salon.
 */
export function registerVoiceHandlers(io: PiscordServer, socket: PiscordSocket): void {
    const { user } = socket.data;

    /** Annonce l'occupation du salon à tous les membres du serveur (liste sous le nom du salon) */
    const broadcastState = (serverId: string, channelId: string): void => {
        io.to(serverRoom(serverId)).emit('voice:state', {
            channelId,
            participants: VoiceStateService.participants(channelId),
        });
    };

    /** Sort le socket de son salon vocal et prévient les autres participants */
    const leaveCurrentChannel = async (): Promise<void> => {
        const channelId = VoiceStateService.leave(socket.id);
        if (!channelId) return;

        await socket.leave(voiceRoom(channelId));
        socket.to(voiceRoom(channelId)).emit('voice:peer-left', { socketId: socket.id });

        const serverId = serverIdByChannel.get(channelId);
        if (serverId) broadcastState(serverId, channelId);
        if (VoiceStateService.peers(channelId).length === 0) serverIdByChannel.delete(channelId);
    };

    socket.on('voice:join', async (channelId, ack) => {
        const reply: VoiceJoinAck = typeof ack === 'function' ? ack : () => {};

        if (typeof channelId !== 'string' || !mongoose.isValidObjectId(channelId)) {
            return reply({ ok: false, code: 'INVALID_ID' });
        }

        try {
            const channel = await AccessService.assertChannelAccess(channelId, user.userId);
            if (channel.type !== 'voice') {
                return reply({ ok: false, code: 'NOT_A_VOICE_CHANNEL' });
            }

            // Un socket n'est que dans un salon vocal à la fois
            await leaveCurrentChannel();

            if (VoiceStateService.isFull(channelId)) {
                return reply({ ok: false, code: 'VOICE_CHANNEL_FULL' });
            }

            // Les participants déjà présents : c'est le nouvel arrivant qui les appellera
            const peers = VoiceStateService.peers(channelId);
            const self: VoicePeer = { socketId: socket.id, userId: user.userId, username: user.username };

            VoiceStateService.join(channelId, self);
            serverIdByChannel.set(channelId, channel.serverId);
            await socket.join(voiceRoom(channelId));

            socket.to(voiceRoom(channelId)).emit('voice:peer-joined', self);
            broadcastState(channel.serverId, channelId);

            reply({ ok: true, peers });
        }
        catch (err) {
            reply({ ok: false, code: err instanceof AppError ? err.code : 'INTERNAL_ERROR' });
        }
    });

    socket.on('voice:leave', () => {
        void leaveCurrentChannel();
    });

    socket.on('voice:signal', (payload) => {
        const to: unknown = payload?.to;
        const channelId = VoiceStateService.channelOf(socket.id);

        // On ne relaie qu'entre deux sockets du même salon vocal
        if (typeof to !== 'string' || !channelId || VoiceStateService.channelOf(to) !== channelId) return;
        if (JSON.stringify(payload.data ?? null).length > MAX_SIGNAL_BYTES) return;

        io.to(to).emit('voice:signal', { from: socket.id, data: payload.data });
    });

    socket.on('disconnect', () => {
        void leaveCurrentChannel();
    });
}
