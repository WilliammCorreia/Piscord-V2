import { beforeEach, describe, expect, it } from 'vitest';
import { type TestUser, createChannel, createInvitation, createServer, createUser, joinServer } from './helpers.ts';

/**
 * Être connecté ne suffit pas : chaque ressource d'un serveur est réservée à ses membres.
 */
describe('Contrôle d\'appartenance', () => {
    let owner: TestUser;
    let outsider: TestUser;
    let serverId: string;
    let channelId: string;

    beforeEach(async () => {
        owner = await createUser();
        outsider = await createUser();
        serverId = await createServer(owner);
        channelId = await createChannel(owner, serverId);
        await owner.agent.post('/api/message').send({ content: 'message privé', referenceId: channelId }).expect(201);
        await createInvitation(owner, serverId);
    });

    describe('un utilisateur extérieur au serveur', () => {
        it('ne peut pas voir le serveur ni ses membres', async () => {
            const res = await outsider.agent.get(`/api/server/${serverId}`).expect(403);

            expect(res.body.code).toBe('NOT_A_MEMBER');
        });

        it('ne peut pas lister les salons', async () => {
            await outsider.agent.get(`/api/channel/server/${serverId}`).expect(403);
        });

        it('ne peut pas créer de salon', async () => {
            await outsider.agent.post('/api/channel').send({ name: 'intrus', serverId }).expect(403);
        });

        it('ne peut pas lire les messages', async () => {
            const res = await outsider.agent.get(`/api/message/reference/${channelId}`).expect(403);

            expect(JSON.stringify(res.body)).not.toContain('message privé');
        });

        it('ne peut pas écrire de message', async () => {
            await outsider.agent.post('/api/message').send({ content: 'spam', referenceId: channelId }).expect(403);
        });

        it("ne peut pas lister les codes d'invitation", async () => {
            const res = await outsider.agent.get(`/api/invitation/server/${serverId}`).expect(403);

            expect(res.body.data).toBeUndefined();
        });

        it("ne peut pas créer d'invitation", async () => {
            await outsider.agent.post('/api/invitation').send({ serverId }).expect(403);
        });

        it('ne voit pas le serveur dans sa liste', async () => {
            const res = await outsider.agent.get('/api/server/user').expect(200);

            expect(res.body.data).toEqual([]);
        });
    });

    describe('un membre du serveur', () => {
        let member: TestUser;

        beforeEach(async () => {
            member = await createUser();
            await joinServer(owner, member, serverId);
        });

        it('accède aux salons, aux messages et aux invitations', async () => {
            const channels = await member.agent.get(`/api/channel/server/${serverId}`).expect(200);
            const messages = await member.agent.get(`/api/message/reference/${channelId}`).expect(200);
            const invitations = await member.agent.get(`/api/invitation/server/${serverId}`).expect(200);

            expect(channels.body.data).toHaveLength(1);
            expect(messages.body.data).toHaveLength(1);
            expect(invitations.body.data.length).toBeGreaterThan(0);
        });

        it('voit les membres du serveur, sans leurs emails', async () => {
            const res = await member.agent.get(`/api/server/${serverId}`).expect(200);

            const usernames = res.body.data.memberIds.map((m: { username: string }) => m.username);
            expect(usernames).toEqual(expect.arrayContaining([owner.username, member.username]));
            expect(JSON.stringify(res.body)).not.toContain(owner.email);
        });

        it('retrouve le serveur dans sa liste', async () => {
            const res = await member.agent.get('/api/server/user').expect(200);

            expect(res.body.data.map((s: { _id: string }) => s._id)).toEqual([serverId]);
        });
    });

    it('répond 404 pour un serveur inexistant et 400 pour un identifiant invalide', async () => {
        await owner.agent.get('/api/server/000000000000000000000000').expect(404);
        await owner.agent.get('/api/channel/server/pas-un-id').expect(400);
    });
});
