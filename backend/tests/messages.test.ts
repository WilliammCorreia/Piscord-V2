import { beforeEach, describe, expect, it } from 'vitest';
import { Message } from '../src/models/Message.ts';
import { type TestUser, createChannel, createServer, createUser, joinServer } from './helpers.ts';

describe('Messages', () => {
    let author: TestUser;
    let serverId: string;
    let channelId: string;

    beforeEach(async () => {
        author = await createUser();
        serverId = await createServer(author);
        channelId = await createChannel(author, serverId);
    });

    /** Insère `count` messages numérotés, du plus ancien (1) au plus récent (count) */
    async function seedMessages(count: number): Promise<void> {
        for (let i = 1; i <= count; i++) {
            await Message.create({ content: `message ${i}`, authorId: author.id, referenceId: channelId });
        }
    }

    describe('pagination', () => {
        it('renvoie les 50 messages les plus récents, dans l\'ordre chronologique', async () => {
            await seedMessages(60);

            const res = await author.agent.get(`/api/message/reference/${channelId}`).expect(200);

            const contents = res.body.data.map((m: { content: string }) => m.content);
            expect(contents).toHaveLength(50);
            expect(contents[0]).toBe('message 11');
            expect(contents[49]).toBe('message 60');
            expect(res.body.hasMore).toBe(true);
        });

        it('remonte dans l\'historique avec le curseur before', async () => {
            await seedMessages(60);
            const firstPage = await author.agent.get(`/api/message/reference/${channelId}`).expect(200);
            const oldestLoaded = firstPage.body.data[0]._id;

            const res = await author.agent
                .get(`/api/message/reference/${channelId}`)
                .query({ before: oldestLoaded })
                .expect(200);

            const contents = res.body.data.map((m: { content: string }) => m.content);
            expect(contents).toHaveLength(10);
            expect(contents[0]).toBe('message 1');
            expect(contents[9]).toBe('message 10');
            expect(res.body.hasMore).toBe(false);
        });

        it('respecte la limite demandée et refuse une limite hors bornes', async () => {
            await seedMessages(5);

            const res = await author.agent.get(`/api/message/reference/${channelId}`).query({ limit: 2 }).expect(200);
            expect(res.body.data.map((m: { content: string }) => m.content)).toEqual(['message 4', 'message 5']);

            await author.agent.get(`/api/message/reference/${channelId}`).query({ limit: 1000 }).expect(400);
        });
    });

    describe('création', () => {
        it("attribue le message à l'utilisateur connecté, pas à celui indiqué dans la requête", async () => {
            const other = await createUser();

            const res = await author.agent
                .post('/api/message')
                .send({ content: 'bonjour', referenceId: channelId, authorId: other.id })
                .expect(201);

            expect(res.body.data.authorId).toMatchObject({ _id: author.id, username: author.username });
        });

        it('refuse un message vide ou trop long', async () => {
            await author.agent.post('/api/message').send({ content: '   ', referenceId: channelId }).expect(400);
            await author.agent.post('/api/message').send({ content: 'a'.repeat(2001), referenceId: channelId }).expect(400);
        });
    });

    describe('suppression', () => {
        let messageId: string;

        beforeEach(async () => {
            const res = await author.agent.post('/api/message').send({ content: 'à supprimer', referenceId: channelId }).expect(201);
            messageId = res.body.data._id;
        });

        it("masque le message supprimé de l'historique", async () => {
            await author.agent.delete(`/api/message/soft/${messageId}`).expect(200);

            const res = await author.agent.get(`/api/message/reference/${channelId}`).expect(200);

            expect(res.body.data).toEqual([]);
            // Soft delete : le message reste en base
            expect(await Message.findById(messageId)).toMatchObject({ isDeleted: true });
        });

        it("refuse qu'un autre membre supprime le message", async () => {
            const member = await createUser();
            await joinServer(author, member, serverId);

            const res = await member.agent.delete(`/api/message/soft/${messageId}`).expect(403);

            expect(res.body.code).toBe('NOT_THE_AUTHOR');
        });

        it('répond 404 pour un message déjà supprimé', async () => {
            await author.agent.delete(`/api/message/soft/${messageId}`).expect(200);

            await author.agent.delete(`/api/message/soft/${messageId}`).expect(404);
        });
    });
});
