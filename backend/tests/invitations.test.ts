import { beforeEach, describe, expect, it } from 'vitest';
import { Invitation } from '../src/models/Invitation.ts';
import { type TestUser, createInvitation, createServer, createUser, joinServer } from './helpers.ts';

describe('Invitations', () => {
    let owner: TestUser;
    let serverId: string;

    beforeEach(async () => {
        owner = await createUser();
        serverId = await createServer(owner);
    });

    describe('rejoindre un serveur', () => {
        it('ajoute le membre, même si le code est saisi en minuscules', async () => {
            const guest = await createUser();
            const code = await createInvitation(owner, serverId);

            const res = await guest.agent.post('/api/invitation/join').send({ code: code.toLowerCase() }).expect(200);

            const memberIds = res.body.data.server.memberIds.map((m: { _id: string }) => m._id);
            expect(memberIds).toEqual(expect.arrayContaining([owner.id, guest.id]));
        });

        it('refuse de rejoindre deux fois le même serveur', async () => {
            const guest = await createUser();
            const code = await createInvitation(owner, serverId);
            await guest.agent.post('/api/invitation/join').send({ code }).expect(200);

            const res = await guest.agent.post('/api/invitation/join').send({ code }).expect(409);

            expect(res.body.code).toBe('ALREADY_MEMBER');
        });

        it('répond 404 pour un code inconnu', async () => {
            await owner.agent.post('/api/invitation/join').send({ code: 'ZZZZZZZZ' }).expect(404);
        });

        it('refuse une invitation expirée', async () => {
            const guest = await createUser();
            const code = await createInvitation(owner, serverId);
            await Invitation.updateOne({ code }, { expiredAt: new Date(Date.now() - 1000) });

            const res = await guest.agent.post('/api/invitation/join').send({ code }).expect(400);

            expect(res.body.code).toBe('INVITATION_EXPIRED');
        });

        it("refuse une invitation dont le nombre d'utilisations est atteint", async () => {
            const [first, second] = [await createUser(), await createUser()];
            const code = await createInvitation(owner, serverId, { maxUsage: 1 });
            await first.agent.post('/api/invitation/join').send({ code }).expect(200);

            const res = await second.agent.post('/api/invitation/join').send({ code }).expect(400);

            expect(res.body.code).toBe('INVITATION_EXHAUSTED');
        });

        it('ne laisse passer qu\'une personne quand plusieurs prennent la dernière place en même temps', async () => {
            const guests = await Promise.all([createUser(), createUser(), createUser(), createUser()]);
            const code = await createInvitation(owner, serverId, { maxUsage: 1 });

            const responses = await Promise.all(
                guests.map((guest) => guest.agent.post('/api/invitation/join').send({ code }))
            );

            expect(responses.filter((res) => res.status === 200)).toHaveLength(1);
            expect(await Invitation.findOne({ code })).toMatchObject({ currentUsage: 1 });
        });
    });

    describe('création', () => {
        it("refuse une date d'expiration passée", async () => {
            const res = await owner.agent
                .post('/api/invitation')
                .send({ serverId, expiredAt: new Date(Date.now() - 1000).toISOString() })
                .expect(400);

            expect(res.body.code).toBe('INVALID_EXPIRATION');
        });
    });

    describe('suppression', () => {
        let member: TestUser;
        let memberCode: string;

        beforeEach(async () => {
            member = await createUser();
            await joinServer(owner, member, serverId);
            memberCode = await createInvitation(member, serverId);
        });

        it("le propriétaire du serveur peut supprimer l'invitation d'un autre membre", async () => {
            await owner.agent.delete('/api/invitation').send({ code: memberCode }).expect(200);

            expect(await Invitation.findOne({ code: memberCode })).toBeNull();
        });

        it('le créateur peut supprimer sa propre invitation', async () => {
            await member.agent.delete('/api/invitation').send({ code: memberCode }).expect(200);
        });

        it("un membre qui n'est ni le créateur ni le propriétaire ne peut pas la supprimer", async () => {
            const other = await createUser();
            await joinServer(owner, other, serverId);

            const res = await other.agent.delete('/api/invitation').send({ code: memberCode }).expect(403);

            expect(res.body.code).toBe('NOT_ALLOWED');
            expect(await Invitation.findOne({ code: memberCode })).not.toBeNull();
        });
    });
});
