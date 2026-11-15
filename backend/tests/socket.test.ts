import type { Socket } from 'socket.io-client';
import { beforeEach, describe, expect, it } from 'vitest';
import { type TestUser, createChannel, createServer, createUser, joinServer } from './helpers.ts';
import { expectNoEvent, nextEvent, useSocketServer } from './socketHelpers.ts';

const server = useSocketServer();
const openSocket = (cookie?: string) => server.open(cookie);

function joinChannel(socket: Socket, channelId: string): Promise<{ ok: boolean; code?: string }> {
    return socket.emitWithAck('join-channel', channelId);
}

describe('Socket.io', () => {
    let alice: TestUser;
    let bob: TestUser;
    let serverId: string;
    let channelId: string;

    beforeEach(async () => {
        alice = await createUser();
        bob = await createUser();
        serverId = await createServer(alice);
        channelId = await createChannel(alice, serverId);
        await joinServer(alice, bob, serverId);
    });

    describe('connexion', () => {
        it('refuse un socket sans session', async () => {
            await expect(openSocket()).rejects.toThrow('UNAUTHORIZED');
        });

        it('refuse un socket dont le cookie est falsifié', async () => {
            await expect(openSocket('accessToken=nimportequoi')).rejects.toThrow('UNAUTHORIZED');
        });

        it('accepte un utilisateur connecté', async () => {
            const socket = await openSocket(alice.cookie);

            expect(socket.connected).toBe(true);
        });

        it("ferme les sockets de l'utilisateur à sa déconnexion", async () => {
            const socket = await openSocket(alice.cookie);
            const disconnected = nextEvent<string>(socket, 'disconnect');

            await alice.agent.post('/api/auth/disconnect').expect(204);

            expect(await disconnected).toBe('io server disconnect');
        });
    });

    describe('salons', () => {
        it("refuse l'entrée dans un salon à un utilisateur extérieur au serveur", async () => {
            const outsider = await createUser();
            const socket = await openSocket(outsider.cookie);

            expect(await joinChannel(socket, channelId)).toEqual({ ok: false, code: 'NOT_A_MEMBER' });

            // ... et il ne reçoit donc pas les messages du salon
            const silence = expectNoEvent(socket, 'message');
            await alice.agent.post('/api/message').send({ content: 'entre membres', referenceId: channelId }).expect(201);
            await silence;
        });

        it('rejette un identifiant de salon invalide', async () => {
            const socket = await openSocket(alice.cookie);

            expect(await joinChannel(socket, 'pas-un-id')).toEqual({ ok: false, code: 'INVALID_ID' });
        });
    });

    describe('messages', () => {
        it('diffuse aux membres du salon le message enregistré, avec son véritable auteur', async () => {
            const bobSocket = await openSocket(bob.cookie);
            expect(await joinChannel(bobSocket, channelId)).toEqual({ ok: true });
            const received = nextEvent<Record<string, unknown>>(bobSocket, 'message');

            const res = await alice.agent.post('/api/message').send({ content: 'salut bob', referenceId: channelId }).expect(201);

            // Le socket reçoit exactement ce que l'API a enregistré
            expect(await received).toEqual(res.body.data);
            expect(res.body.data.authorId).toMatchObject({ _id: alice.id, username: alice.username });
        });

        it("ne relaie pas un « message » émis directement par un client", async () => {
            const aliceSocket = await openSocket(alice.cookie);
            const bobSocket = await openSocket(bob.cookie);
            await joinChannel(aliceSocket, channelId);
            await joinChannel(bobSocket, channelId);
            const silence = expectNoEvent(bobSocket, 'message');

            aliceSocket.emit('message', {
                content: 'faux message',
                referenceId: channelId,
                authorId: { _id: bob.id, username: bob.username },
            });

            await silence;
        });

        it('signale la suppression aux membres du salon', async () => {
            const bobSocket = await openSocket(bob.cookie);
            await joinChannel(bobSocket, channelId);
            const created = await alice.agent.post('/api/message').send({ content: 'oups', referenceId: channelId }).expect(201);
            const deleted = nextEvent(bobSocket, 'message-deleted');

            await alice.agent.delete(`/api/message/soft/${created.body.data._id}`).expect(200);

            expect(await deleted).toEqual({ _id: created.body.data._id, referenceId: channelId });
        });
    });

    describe('indicateur de saisie', () => {
        it('utilise le pseudo de la session, pas celui envoyé par le client', async () => {
            const aliceSocket = await openSocket(alice.cookie);
            const bobSocket = await openSocket(bob.cookie);
            await joinChannel(aliceSocket, channelId);
            await joinChannel(bobSocket, channelId);
            const typing = nextEvent(bobSocket, 'typing');

            aliceSocket.emit('typing', { channelId, username: 'admin' });

            expect(await typing).toEqual({ username: alice.username, channelId });
        });

        it("ignore la saisie d'un socket qui n'est pas dans le salon", async () => {
            const outsider = await createUser();
            const outsiderSocket = await openSocket(outsider.cookie);
            const bobSocket = await openSocket(bob.cookie);
            await joinChannel(bobSocket, channelId);
            const silence = expectNoEvent(bobSocket, 'typing');

            outsiderSocket.emit('typing', { channelId });

            await silence;
        });
    });
});
