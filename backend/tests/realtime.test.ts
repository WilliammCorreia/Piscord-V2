import type { Socket } from 'socket.io-client';
import { beforeEach, describe, expect, it } from 'vitest';
import { type TestUser, befriend, createChannel, createInvitation, createServer, createUser, joinServer } from './helpers.ts';
import { expectNoEvent, nextEvent, nextEventMatching, settle, useSocketServer } from './socketHelpers.ts';

const server = useSocketServer();

interface Presence { userId: string; online: boolean }
interface VoicePeer { socketId: string; userId: string; username: string }
interface VoiceState { channelId: string; participants: { userId: string; username: string }[] }
type VoiceJoin = { ok: true; peers: VoicePeer[] } | { ok: false; code: string };

const presenceOf = (userId: string, online: boolean) => (p: Presence) => p.userId === userId && p.online === online;

describe('Statut de connexion', () => {
    let alice: TestUser;
    let bob: TestUser;
    let serverId: string;

    beforeEach(async () => {
        alice = await createUser();
        bob = await createUser();
        serverId = await createServer(alice);
        await joinServer(alice, bob, serverId);
    });

    const membersOnline = async (user: TestUser): Promise<Record<string, boolean>> => {
        const res = await user.agent.get(`/api/server/${serverId}`).expect(200);
        return Object.fromEntries(res.body.data.memberIds.map((m: { username: string; online: boolean }) => [m.username, m.online]));
    };

    it('indique dans la liste des membres qui est connecté', async () => {
        expect(await membersOnline(alice)).toEqual({ [alice.username]: false, [bob.username]: false });

        await server.open(bob.cookie);

        expect(await membersOnline(alice)).toEqual({ [alice.username]: false, [bob.username]: true });
    });

    it("prévient les membres du serveur quand quelqu'un se connecte puis se déconnecte", async () => {
        const aliceSocket = await server.open(alice.cookie);
        const online = nextEventMatching<Presence>(aliceSocket, 'presence', presenceOf(bob.id, true));

        const bobSocket = await server.open(bob.cookie);
        expect(await online).toEqual({ userId: bob.id, online: true });

        const offline = nextEventMatching<Presence>(aliceSocket, 'presence', presenceOf(bob.id, false));
        bobSocket.disconnect();
        expect(await offline).toEqual({ userId: bob.id, online: false });
        expect(await membersOnline(alice)).toMatchObject({ [bob.username]: false });
    });

    it("reste en ligne tant qu'il lui reste un onglet ouvert", async () => {
        const aliceSocket = await server.open(alice.cookie);
        const firstTab = await server.open(bob.cookie);
        await server.open(bob.cookie);
        await settle();

        const silence = expectNoEvent<Presence>(aliceSocket, 'presence', (p) => p.userId === bob.id);
        firstTab.disconnect();
        await silence;

        expect(await membersOnline(alice)).toMatchObject({ [bob.username]: true });
    });

    it('prévient aussi les amis, même sans serveur en commun', async () => {
        const carol = await createUser();
        await befriend(alice, carol);
        const aliceSocket = await server.open(alice.cookie);
        const online = nextEventMatching<Presence>(aliceSocket, 'presence', presenceOf(carol.id, true));

        await server.open(carol.cookie);

        expect(await online).toEqual({ userId: carol.id, online: true });
        const friends = (await alice.agent.get('/api/friend').expect(200)).body.data.friends;
        expect(friends[0].user).toMatchObject({ username: carol.username, online: true });
    });

    it("ne dit rien à quelqu'un qui n'a ni serveur ni ami en commun", async () => {
        const stranger = await createUser();
        const strangerSocket = await server.open(stranger.cookie);
        await settle();
        const silence = expectNoEvent<Presence>(strangerSocket, 'presence', (p) => p.userId === bob.id);

        await server.open(bob.cookie);

        await silence;
    });

    it("annonce l'arrivée d'un nouveau membre, qui reçoit ensuite la présence du serveur", async () => {
        const carol = await createUser();
        const aliceSocket = await server.open(alice.cookie);
        const carolSocket = await server.open(carol.cookie);
        const joined = nextEvent<{ serverId: string; member: { _id: string; username: string; online: boolean } }>(aliceSocket, 'member-joined');

        const code = await createInvitation(alice, serverId);
        await carol.agent.post('/api/invitation/join').send({ code }).expect(200);

        expect(await joined).toEqual({ serverId, member: { _id: carol.id, username: carol.username, online: true } });

        // Carol est entrée dans la room du serveur sans avoir à se reconnecter
        const bobOnline = nextEventMatching<Presence>(carolSocket, 'presence', presenceOf(bob.id, true));
        await server.open(bob.cookie);
        expect(await bobOnline).toEqual({ userId: bob.id, online: true });
    });
});

describe('Amis et messages privés en temps réel', () => {
    let alice: TestUser;
    let bob: TestUser;

    beforeEach(async () => {
        alice = await createUser();
        bob = await createUser();
    });

    it("prévient les deux utilisateurs à chaque étape d'une demande d'ami", async () => {
        const aliceSocket = await server.open(alice.cookie);
        const bobSocket = await server.open(bob.cookie);

        let notified = [nextEvent(aliceSocket, 'friends-changed'), nextEvent(bobSocket, 'friends-changed')];
        const res = await alice.agent.post('/api/friend/request').send({ username: bob.username }).expect(201);
        await Promise.all(notified);

        notified = [nextEvent(aliceSocket, 'friends-changed'), nextEvent(bobSocket, 'friends-changed')];
        await bob.agent.post(`/api/friend/${res.body.data._id}/accept`).expect(200);
        await Promise.all(notified);
    });

    it("remet un message privé à son destinataire, même s'il n'a pas la conversation ouverte", async () => {
        const { conversationId } = await befriend(alice, bob);
        const bobSocket = await server.open(bob.cookie);
        const received = nextEvent<{ content: string; referenceId: string; authorId: { username: string } }>(bobSocket, 'message');

        await alice.agent.post('/api/message').send({ content: 'tu es là ?', referenceId: conversationId }).expect(201);

        expect(await received).toMatchObject({
            content: 'tu es là ?',
            referenceId: conversationId,
            authorId: { username: alice.username },
        });
    });

    it("ne remet le message privé qu'une fois à un socket qui a aussi ouvert la conversation", async () => {
        const { conversationId } = await befriend(alice, bob);
        const bobSocket = await server.open(bob.cookie);
        expect(await bobSocket.emitWithAck('join-channel', conversationId)).toEqual({ ok: true });
        let count = 0;
        bobSocket.on('message', () => { count++; });

        await alice.agent.post('/api/message').send({ content: 'une seule fois', referenceId: conversationId }).expect(201);
        await settle(200);

        expect(count).toBe(1);
    });

    it("refuse l'entrée dans la conversation de deux autres personnes", async () => {
        const { conversationId } = await befriend(alice, bob);
        const carol = await createUser();
        const carolSocket = await server.open(carol.cookie);

        expect(await carolSocket.emitWithAck('join-channel', conversationId)).toEqual({ ok: false, code: 'NOT_A_PARTICIPANT' });
    });
});

describe('Salons vocaux', () => {
    let alice: TestUser;
    let bob: TestUser;
    let serverId: string;
    let voiceId: string;
    let textId: string;

    beforeEach(async () => {
        alice = await createUser();
        bob = await createUser();
        serverId = await createServer(alice);
        textId = await createChannel(alice, serverId, 'général');
        voiceId = await createChannel(alice, serverId, 'vocal', 'voice');
        await joinServer(alice, bob, serverId);
    });

    const joinVoice = (socket: Socket, channelId = voiceId): Promise<VoiceJoin> => socket.emitWithAck('voice:join', channelId);

    it('donne au nouvel arrivant la liste des participants, et le présente aux autres', async () => {
        const aliceSocket = await server.open(alice.cookie);
        const bobSocket = await server.open(bob.cookie);

        expect(await joinVoice(aliceSocket)).toEqual({ ok: true, peers: [] });

        const announced = nextEvent<VoicePeer>(aliceSocket, 'voice:peer-joined');
        const bobJoin = await joinVoice(bobSocket);

        expect(bobJoin).toEqual({ ok: true, peers: [{ socketId: aliceSocket.id, userId: alice.id, username: alice.username }] });
        expect(await announced).toEqual({ socketId: bobSocket.id, userId: bob.id, username: bob.username });
    });

    it("montre l'occupation du salon à tous les membres du serveur, même hors du salon", async () => {
        const aliceSocket = await server.open(alice.cookie);
        const bobSocket = await server.open(bob.cookie);
        await settle();
        const state = nextEvent<VoiceState>(aliceSocket, 'voice:state');

        await joinVoice(bobSocket);

        expect(await state).toEqual({ channelId: voiceId, participants: [{ userId: bob.id, username: bob.username }] });

        const channels = (await alice.agent.get(`/api/channel/server/${serverId}`).expect(200)).body.data;
        const voice = channels.find((c: { _id: string }) => c._id === voiceId);
        const text = channels.find((c: { _id: string }) => c._id === textId);
        expect(voice).toMatchObject({ type: 'voice', participants: [{ userId: bob.id, username: bob.username }] });
        expect(text.type).toBe('text');
        expect(text.participants).toBeUndefined();
    });

    it('relaie la signalisation WebRTC entre deux participants du salon', async () => {
        const aliceSocket = await server.open(alice.cookie);
        const bobSocket = await server.open(bob.cookie);
        await joinVoice(aliceSocket);
        await joinVoice(bobSocket);
        const signal = nextEvent<{ from: string; data: unknown }>(aliceSocket, 'voice:signal');
        const offer = { description: { type: 'offer', sdp: 'v=0...' } };

        bobSocket.emit('voice:signal', { to: aliceSocket.id, data: offer });

        expect(await signal).toEqual({ from: bobSocket.id, data: offer });
    });

    it("ne relaie rien vers un socket qui n'est pas dans le même salon vocal", async () => {
        const aliceSocket = await server.open(alice.cookie);
        const bobSocket = await server.open(bob.cookie);
        await joinVoice(bobSocket);
        await settle();
        const silence = expectNoEvent(aliceSocket, 'voice:signal');

        // Alice est connectée mais n'a pas rejoint le salon : Bob connaît son socket, ça ne suffit pas
        bobSocket.emit('voice:signal', { to: aliceSocket.id, data: { description: { type: 'offer', sdp: 'x' } } });

        await silence;
    });

    it('signale le départ, volontaire ou par fermeture du socket', async () => {
        const aliceSocket = await server.open(alice.cookie);
        const bobSocket = await server.open(bob.cookie);
        await joinVoice(aliceSocket);
        await joinVoice(bobSocket);

        let left = nextEvent<{ socketId: string }>(aliceSocket, 'voice:peer-left');
        const bobSocketId = bobSocket.id;
        bobSocket.emit('voice:leave');
        expect(await left).toEqual({ socketId: bobSocketId });

        await joinVoice(bobSocket);
        left = nextEvent<{ socketId: string }>(aliceSocket, 'voice:peer-left');
        const emptied = nextEventMatching<VoiceState>(aliceSocket, 'voice:state', (s) => s.participants.length === 1);
        bobSocket.disconnect();

        expect(await left).toEqual({ socketId: bobSocketId });
        expect(await emptied).toEqual({ channelId: voiceId, participants: [{ userId: alice.id, username: alice.username }] });
    });

    it("refuse un utilisateur extérieur au serveur, et un salon qui n'est pas vocal", async () => {
        const outsider = await createUser();
        const outsiderSocket = await server.open(outsider.cookie);
        const aliceSocket = await server.open(alice.cookie);

        expect(await joinVoice(outsiderSocket)).toEqual({ ok: false, code: 'NOT_A_MEMBER' });
        expect(await joinVoice(aliceSocket, textId)).toEqual({ ok: false, code: 'NOT_A_VOICE_CHANNEL' });
        expect(await joinVoice(aliceSocket, 'pas-un-id')).toEqual({ ok: false, code: 'INVALID_ID' });
    });

    it('fait quitter le salon précédent quand on en rejoint un autre', async () => {
        const otherVoiceId = await createChannel(alice, serverId, 'vocal 2', 'voice');
        const aliceSocket = await server.open(alice.cookie);
        const bobSocket = await server.open(bob.cookie);
        await joinVoice(aliceSocket);
        await joinVoice(bobSocket);
        const left = nextEvent<{ socketId: string }>(aliceSocket, 'voice:peer-left');

        expect(await joinVoice(bobSocket, otherVoiceId)).toEqual({ ok: true, peers: [] });

        expect(await left).toEqual({ socketId: bobSocket.id });
    });
});
