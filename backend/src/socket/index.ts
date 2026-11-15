import type { Server as HttpServer } from 'node:http';
import { parse as parseCookie } from 'cookie';
import mongoose from 'mongoose';
import { Server, type Socket } from 'socket.io';
import { env } from '../config/env.ts';
import { AppError } from '../errors/AppError.ts';
import type { PopulatedMessage } from '../models/Message.ts';
import AccessService from '../services/AccessService.ts';
import AuthService from '../services/AuthService.ts';
import type { AuthUser } from '../types/auth.ts';

type JoinAck = (response: { ok: true } | { ok: false; code: string }) => void;

/** Événements que le client a le droit d'envoyer. Il n'y a volontairement pas de « message » :
 *  les messages passent par l'API HTTP, qui les enregistre avant de les diffuser. */
interface ClientToServerEvents {
    'join-channel': (channelId: string, ack?: JoinAck) => void;
    'leave-channel': (channelId: string) => void;
    typing: (payload: { channelId: string }) => void;
}

interface ServerToClientEvents {
    message: (message: unknown) => void;
    'message-deleted': (payload: { _id: string; referenceId: string }) => void;
    typing: (payload: { username: string; channelId: string }) => void;
}

interface SocketData {
    user: AuthUser;
}

type PiscordServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type PiscordSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

let io: PiscordServer | null = null;

const channelRoom = (channelId: string) => `channel:${channelId}`;
const userRoom = (userId: string) => `user:${userId}`;

/** Un client peut envoyer n'importe quoi : on ne fait confiance à aucun payload */
function isValidId(value: unknown): value is string {
    return typeof value === 'string' && mongoose.isValidObjectId(value);
}

/**
 * Démarre Socket.io sur le serveur HTTP.
 * Chaque connexion est authentifiée avec les mêmes cookies que l'API.
 */
export function initSocket(httpServer: HttpServer): PiscordServer {
    io = new Server(httpServer, {
        cors: env.corsOrigins.length > 0
            ? { origin: env.corsOrigins, credentials: true }
            : undefined,
    });

    io.use(async (socket, next) => {
        try {
            const cookies = parseCookie(socket.handshake.headers.cookie ?? '');
            const { user } = await AuthService.authenticate(cookies['accessToken'], cookies['refreshToken']);
            socket.data.user = user;
            next();
        }
        catch {
            next(new Error('UNAUTHORIZED'));
        }
    });

    io.on('connection', (socket) => {
        // Room personnelle : permet de couper tous les sockets d'un utilisateur à sa déconnexion
        void socket.join(userRoom(socket.data.user.userId));
        registerHandlers(socket);
    });

    return io;
}

function registerHandlers(socket: PiscordSocket): void {
    const { user } = socket.data;

    socket.on('join-channel', async (channelId, ack) => {
        const reply: JoinAck = typeof ack === 'function' ? ack : () => {};

        if (!isValidId(channelId)) {
            return reply({ ok: false, code: 'INVALID_ID' });
        }

        try {
            await AccessService.assertChannelAccess(channelId, user.userId);
            await socket.join(channelRoom(channelId));
            reply({ ok: true });
        }
        catch (err) {
            reply({ ok: false, code: err instanceof AppError ? err.code : 'INTERNAL_ERROR' });
        }
    });

    socket.on('leave-channel', (channelId) => {
        if (isValidId(channelId)) {
            void socket.leave(channelRoom(channelId));
        }
    });

    socket.on('typing', (payload) => {
        const channelId: unknown = payload?.channelId;

        // Seul un socket déjà admis dans le salon peut y signaler qu'il écrit,
        // et le pseudo vient de la session, jamais du client
        if (isValidId(channelId) && socket.rooms.has(channelRoom(channelId))) {
            socket.to(channelRoom(channelId)).emit('typing', { username: user.username, channelId });
        }
    });
}

/**
 * Diffuse un message enregistré à tous les sockets présents dans le salon
 */
export function emitMessage(channelId: string, message: PopulatedMessage): void {
    // Aller-retour JSON : le client reçoit exactement la même forme que par l'API HTTP
    io?.to(channelRoom(channelId)).emit('message', JSON.parse(JSON.stringify(message)));
}

/**
 * Signale la suppression d'un message aux sockets présents dans le salon
 */
export function emitMessageDeleted(channelId: string, messageId: string): void {
    io?.to(channelRoom(channelId)).emit('message-deleted', { _id: messageId, referenceId: channelId });
}

/**
 * Ferme tous les sockets d'un utilisateur (appelé à la déconnexion)
 */
export function disconnectUser(userId: string): void {
    io?.in(userRoom(userId)).disconnectSockets(true);
}
