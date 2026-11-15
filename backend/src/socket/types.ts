import type { Server, Socket } from 'socket.io';
import type { VoiceParticipant, VoicePeer } from '../services/VoiceStateService.ts';
import type { AuthUser } from '../types/auth.ts';

export type JoinAck = (response: { ok: true } | { ok: false; code: string }) => void;

export type VoiceJoinAck = (
    response: { ok: true; peers: VoicePeer[] } | { ok: false; code: string }
) => void;

/** Événements que le client a le droit d'envoyer. Il n'y a volontairement pas de « message » :
 *  les messages passent par l'API HTTP, qui les enregistre avant de les diffuser. */
export interface ClientToServerEvents {
    'join-channel': (channelId: string, ack?: JoinAck) => void;
    'leave-channel': (channelId: string) => void;
    typing: (payload: { channelId: string }) => void;

    'voice:join': (channelId: string, ack?: VoiceJoinAck) => void;
    'voice:leave': () => void;
    /** Signalisation WebRTC (offre, réponse, candidat ICE) destinée à un autre participant */
    'voice:signal': (payload: { to: string; data: unknown }) => void;
}

export interface ServerToClientEvents {
    message: (message: unknown) => void;
    'message-deleted': (payload: { _id: string; referenceId: string }) => void;
    typing: (payload: { username: string; channelId: string }) => void;

    presence: (payload: { userId: string; online: boolean }) => void;
    'member-joined': (payload: { serverId: string; member: { _id: string; username: string; online: boolean } }) => void;
    'friends-changed': () => void;

    'voice:peer-joined': (peer: VoicePeer) => void;
    'voice:peer-left': (payload: { socketId: string }) => void;
    'voice:signal': (payload: { from: string; data: unknown }) => void;
    /** Occupation d'un salon vocal, diffusée à tous les membres du serveur */
    'voice:state': (payload: { channelId: string; participants: VoiceParticipant[] }) => void;
}

export interface SocketData {
    user: AuthUser;
}

export type PiscordServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type PiscordSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export const channelRoom = (channelId: string) => `channel:${channelId}`;
export const userRoom = (userId: string) => `user:${userId}`;
export const serverRoom = (serverId: string) => `server:${serverId}`;
export const voiceRoom = (channelId: string) => `voice:${channelId}`;
