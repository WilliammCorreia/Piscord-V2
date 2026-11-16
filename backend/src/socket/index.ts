import type { Server as HttpServer } from 'node:http';
import { parse as parseCookie } from 'cookie';
import { Server } from 'socket.io';
import { env } from '../config/env.ts';
import { AppError } from '../errors/AppError.ts';
import type { PopulatedMessage } from '../models/Message.ts';
import FriendRepository from '../repositories/FriendRepository.ts';
import ServerRepository from '../repositories/ServerRepository.ts';
import AccessService, { isReferenceId } from '../services/AccessService.ts';
import AuthService from '../services/AuthService.ts';
import PresenceService from '../services/PresenceService.ts';
import {
    type JoinAck,
    type PiscordServer,
    type PiscordSocket,
    channelRoom,
    serverRoom,
    userRoom,
} from './types.ts';
import { registerVoiceHandlers } from './voice.ts';

let io: PiscordServer | null = null;

/**
 * Démarre Socket.io sur le serveur HTTP.
 * Chaque connexion est authentifiée avec les mêmes cookies que l'API.
 */
export function initSocket(httpServer: HttpServer): PiscordServer {
    const server: PiscordServer = new Server(httpServer, {
        cors: env.corsOrigins.length > 0
            ? { origin: env.corsOrigins, credentials: true }
            : undefined,
        // Battement de cœur resserré (25 s + 20 s par défaut) : une connexion coupée sans prévenir
        // (réseau perdu, appareil en veille) est détectée en 20 secondes au plus, et le statut
        // « en ligne » de l'utilisateur ne reste pas affiché à tort plus longtemps.
        pingInterval: 10_000,
        pingTimeout: 10_000,
    });
    io = server;

    server.use(async (socket, next) => {
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

    server.on('connection', (socket) => {
        void onConnection(server, socket);
    });

    return server;
}

async function onConnection(server: PiscordServer, socket: PiscordSocket): Promise<void> {
    const { userId } = socket.data.user;

    // Tout ceci avant le premier `await` : un socket qui se ferme aussitôt doit quand même
    // être décompté, et une déconnexion immédiate doit pouvoir le retrouver dans sa room.
    void socket.join(userRoom(userId));
    registerChatHandlers(socket);
    registerVoiceHandlers(server, socket);

    const cameOnline = PresenceService.connect(userId);

    socket.on('disconnect', () => {
        if (PresenceService.disconnect(userId)) {
            void broadcastPresence(userId, false);
        }
    });

    try {
        // Une room par serveur : présence des membres et occupation des salons vocaux
        const serverIds = await ServerRepository.findIdsByMember(userId);
        await socket.join(serverIds.map(serverRoom));

        if (cameOnline) {
            await broadcastPresence(userId, true);
        }
    }
    catch (err) {
        console.error('Initialisation du socket impossible :', err);
        socket.disconnect(true);
    }
}

function registerChatHandlers(socket: PiscordSocket): void {
    const { user } = socket.data;

    socket.on('join-channel', async (channelId, ack) => {
        const reply: JoinAck = typeof ack === 'function' ? ack : () => {};

        // Un client peut envoyer n'importe quoi : on ne fait confiance à aucun payload
        if (!isReferenceId(channelId)) {
            return reply({ ok: false, code: 'INVALID_ID' });
        }

        try {
            await AccessService.assertReferenceAccess(channelId, user.userId);
            await socket.join(channelRoom(channelId));
            reply({ ok: true });
        }
        catch (err) {
            reply({ ok: false, code: err instanceof AppError ? err.code : 'INTERNAL_ERROR' });
        }
    });

    socket.on('leave-channel', (channelId) => {
        if (isReferenceId(channelId)) {
            void socket.leave(channelRoom(channelId));
        }
    });

    socket.on('typing', (payload) => {
        const channelId: unknown = payload?.channelId;

        // Seul un socket déjà admis dans le salon peut y signaler qu'il écrit,
        // et le pseudo vient de la session, jamais du client
        if (isReferenceId(channelId) && socket.rooms.has(channelRoom(channelId))) {
            socket.to(channelRoom(channelId)).emit('typing', { username: user.username, channelId });
        }
    });
}

/**
 * Annonce un changement de statut à ceux qui ont le droit de le voir :
 * les membres des serveurs de l'utilisateur et ses amis.
 */
async function broadcastPresence(userId: string, online: boolean): Promise<void> {
    if (!io) return;

    try {
        const [serverIds, friendIds] = await Promise.all([
            ServerRepository.findIdsByMember(userId),
            FriendRepository.findFriendIds(userId),
        ]);

        const rooms = [userRoom(userId), ...serverIds.map(serverRoom), ...friendIds.map(userRoom)];
        io.to(rooms).emit('presence', { userId, online });
    }
    catch (err) {
        console.error('Diffusion de la présence impossible :', err);
    }
}

/**
 * Diffuse un message enregistré à tous les sockets présents dans le salon
 * @param recipientIds - Pour une conversation privée : les deux participants, prévenus
 *                       même s'ils n'ont pas la conversation ouverte
 */
export function emitMessage(referenceId: string, message: PopulatedMessage, recipientIds: string[] = []): void {
    // Aller-retour JSON : le client reçoit exactement la même forme que par l'API HTTP.
    // Un socket présent dans plusieurs des rooms visées ne reçoit l'événement qu'une fois.
    io?.to([channelRoom(referenceId), ...recipientIds.map(userRoom)])
        .emit('message', JSON.parse(JSON.stringify(message)));
}

/**
 * Signale la suppression d'un message aux sockets présents dans le salon
 */
export function emitMessageDeleted(referenceId: string, messageId: string): void {
    io?.to(channelRoom(referenceId)).emit('message-deleted', { _id: messageId, referenceId });
}

/**
 * Prévient des utilisateurs que leur liste d'amis ou de demandes a changé
 */
export function emitFriendsChanged(userIds: string[]): void {
    if (userIds.length > 0) {
        io?.to(userIds.map(userRoom)).emit('friends-changed');
    }
}

/**
 * Fait entrer les sockets d'un utilisateur dans la room d'un serveur qu'il vient de créer
 * ou de rejoindre, et l'annonce aux autres membres connectés.
 */
export function addUserToServer(userId: string, username: string, serverId: string): void {
    if (!io) return;

    io.to(serverRoom(serverId)).emit('member-joined', {
        serverId,
        member: { _id: userId, username, online: PresenceService.isOnline(userId) },
    });
    io.in(userRoom(userId)).socketsJoin(serverRoom(serverId));
}

/**
 * Ferme tous les sockets d'un utilisateur (appelé à la déconnexion)
 */
export function disconnectUser(userId: string): void {
    io?.in(userRoom(userId)).disconnectSockets(true);
}
