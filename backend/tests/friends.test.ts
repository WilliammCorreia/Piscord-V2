import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { Message } from '../src/models/Message.ts';
import { PASSWORD, type TestUser, app, befriend, createUser } from './helpers.ts';

describe('Amis', () => {
    let alice: TestUser;
    let bob: TestUser;

    beforeEach(async () => {
        alice = await createUser();
        bob = await createUser();
    });

    const friendList = async (user: TestUser) => (await user.agent.get('/api/friend').expect(200)).body.data;

    describe("demande d'ami", () => {
        it('apparaît en attente chez les deux utilisateurs', async () => {
            await alice.agent.post('/api/friend/request').send({ username: bob.username }).expect(201);

            const aliceList = await friendList(alice);
            const bobList = await friendList(bob);

            expect(aliceList.outgoing.map((r: { user: { username: string } }) => r.user.username)).toEqual([bob.username]);
            expect(bobList.incoming.map((r: { user: { username: string } }) => r.user.username)).toEqual([alice.username]);
            expect(aliceList.friends).toEqual([]);
            expect(bobList.friends).toEqual([]);
        });

        it("retrouve le destinataire quelle que soit la casse du pseudo, ou par son identifiant", async () => {
            await alice.agent.post('/api/friend/request').send({ username: bob.username.toUpperCase() }).expect(201);

            const carol = await createUser();
            await alice.agent.post('/api/friend/request').send({ userId: carol.id }).expect(201);

            expect((await friendList(alice)).outgoing).toHaveLength(2);
        });

        it('refuse une demande à soi-même, à un inconnu ou en double', async () => {
            const self = await alice.agent.post('/api/friend/request').send({ username: alice.username }).expect(400);
            const unknown = await alice.agent.post('/api/friend/request').send({ username: 'personne' }).expect(404);
            await alice.agent.post('/api/friend/request').send({ username: bob.username }).expect(201);
            const duplicate = await alice.agent.post('/api/friend/request').send({ username: bob.username }).expect(409);

            expect(self.body.code).toBe('CANNOT_ADD_SELF');
            expect(unknown.body.code).toBe('USER_NOT_FOUND');
            expect(duplicate.body.code).toBe('REQUEST_ALREADY_SENT');
        });

        it('exige un pseudo ou un identifiant, mais pas les deux', async () => {
            await alice.agent.post('/api/friend/request').send({}).expect(400);
            await alice.agent.post('/api/friend/request').send({ username: bob.username, userId: bob.id }).expect(400);
        });
    });

    describe('acceptation', () => {
        let friendshipId: string;

        beforeEach(async () => {
            const res = await alice.agent.post('/api/friend/request').send({ username: bob.username }).expect(201);
            friendshipId = res.body.data._id;
        });

        it('rend les deux utilisateurs amis, avec une conversation privée commune', async () => {
            await bob.agent.post(`/api/friend/${friendshipId}/accept`).expect(200);

            const aliceList = await friendList(alice);
            const bobList = await friendList(bob);

            expect(aliceList.friends[0].user).toMatchObject({ _id: bob.id, username: bob.username, online: false });
            expect(bobList.friends[0].user).toMatchObject({ _id: alice.id, username: alice.username });
            expect(aliceList.friends[0].conversationId).toBe(bobList.friends[0].conversationId);
            expect(aliceList.outgoing).toEqual([]);
            expect(bobList.incoming).toEqual([]);
        });

        it("n'est possible que pour le destinataire de la demande", async () => {
            const carol = await createUser();

            await alice.agent.post(`/api/friend/${friendshipId}/accept`).expect(403);
            await carol.agent.post(`/api/friend/${friendshipId}/accept`).expect(403);

            expect((await friendList(alice)).friends).toEqual([]);
        });

        it("est automatique quand l'autre envoie à son tour une demande", async () => {
            const res = await bob.agent.post('/api/friend/request').send({ username: alice.username }).expect(201);

            expect(res.body.data.status).toBe('accepted');
            expect((await friendList(alice)).friends).toHaveLength(1);
        });

        it('refuse une nouvelle demande entre deux amis', async () => {
            await bob.agent.post(`/api/friend/${friendshipId}/accept`).expect(200);

            const res = await alice.agent.post('/api/friend/request').send({ username: bob.username }).expect(409);

            expect(res.body.code).toBe('ALREADY_FRIENDS');
        });
    });

    describe('suppression', () => {
        it("permet de refuser ou d'annuler une demande", async () => {
            const res = await alice.agent.post('/api/friend/request').send({ username: bob.username }).expect(201);

            await bob.agent.delete(`/api/friend/${res.body.data._id}`).expect(200);

            expect((await friendList(alice)).outgoing).toEqual([]);
            expect((await friendList(bob)).incoming).toEqual([]);
        });

        it('permet de retirer un ami', async () => {
            const { friendshipId } = await befriend(alice, bob);

            await alice.agent.delete(`/api/friend/${friendshipId}`).expect(200);

            expect((await friendList(bob)).friends).toEqual([]);
        });

        it("est refusée à quelqu'un que la relation ne concerne pas", async () => {
            const { friendshipId } = await befriend(alice, bob);
            const carol = await createUser();

            await carol.agent.delete(`/api/friend/${friendshipId}`).expect(403);

            expect((await friendList(alice)).friends).toHaveLength(1);
        });
    });

    it('refuse à l\'inscription un pseudo déjà pris, quelle que soit la casse', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'autre@test.com', password: PASSWORD, username: alice.username.toUpperCase() })
            .expect(409);

        expect(res.body.code).toBe('USERNAME_TAKEN');
    });
});

describe('Messages privés', () => {
    let alice: TestUser;
    let bob: TestUser;
    let conversationId: string;
    let friendshipId: string;

    beforeEach(async () => {
        alice = await createUser();
        bob = await createUser();
        ({ conversationId, friendshipId } = await befriend(alice, bob));
    });

    const send = (user: TestUser, content: string) =>
        user.agent.post('/api/message').send({ content, referenceId: conversationId });
    const history = (user: TestUser) => user.agent.get(`/api/message/reference/${conversationId}`);

    it('deux amis échangent des messages dans la même conversation', async () => {
        await send(alice, 'salut bob').expect(201);
        await send(bob, 'salut alice').expect(201);

        const res = await history(alice).expect(200);

        expect(res.body.data.map((m: { content: string; authorId: { username: string } }) => [m.authorId.username, m.content]))
            .toEqual([[alice.username, 'salut bob'], [bob.username, 'salut alice']]);
    });

    it("un tiers ne peut ni lire ni écrire dans la conversation", async () => {
        await send(alice, 'entre nous').expect(201);
        const carol = await createUser();

        const read = await history(carol).expect(403);
        const write = await send(carol, 'coucou').expect(403);

        expect(read.body.code).toBe('NOT_A_PARTICIPANT');
        expect(write.body.code).toBe('NOT_A_PARTICIPANT');
        expect(JSON.stringify(read.body)).not.toContain('entre nous');
    });

    it("une demande d'ami en attente ne suffit pas pour écrire", async () => {
        const carol = await createUser();
        await alice.agent.post('/api/friend/request').send({ username: carol.username }).expect(201);
        const pendingConversation = [alice.id, carol.id].sort().join('_');

        const res = await alice.agent.post('/api/message').send({ content: 'insistant', referenceId: pendingConversation }).expect(403);

        expect(res.body.code).toBe('NOT_FRIENDS');
        expect(await Message.countDocuments({ referenceId: pendingConversation })).toBe(0);
    });

    it("la conversation se ferme quand l'amitié est retirée, et se retrouve intacte quand elle reprend", async () => {
        await send(alice, 'avant la dispute').expect(201);
        await bob.agent.delete(`/api/friend/${friendshipId}`).expect(200);

        await history(alice).expect(403);
        await send(alice, 'tu me lis ?').expect(403);

        await befriend(alice, bob);
        const res = await history(bob).expect(200);

        expect(res.body.data.map((m: { content: string }) => m.content)).toEqual(['avant la dispute']);
    });

    it('rejette une référence de conversation mal formée', async () => {
        await alice.agent.post('/api/message').send({ content: 'x', referenceId: `${alice.id}_pas-un-id` }).expect(400);
    });
});
