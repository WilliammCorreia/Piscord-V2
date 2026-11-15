import request from 'supertest';
import { createApp } from '../src/app.ts';

export const app = createApp();

export const PASSWORD = 'Motdepasse-123!';

export type Agent = ReturnType<typeof request.agent>;

export interface TestUser {
    /** Client HTTP qui conserve les cookies de session de cet utilisateur */
    agent: Agent;
    id: string;
    email: string;
    username: string;
    /** En-tête Cookie prêt à l'emploi (pour Socket.io ou pour rejouer une session) */
    cookie: string;
}

let userCounter = 0;

/** Transforme les en-têtes Set-Cookie d'une réponse en valeur d'en-tête Cookie */
export function toCookieHeader(setCookie: string | string[] | undefined): string {
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    return cookies.map((cookie) => cookie.split(';')[0]).join('; ');
}

/** Lit la valeur d'un cookie dans un en-tête Cookie */
export function cookieValue(cookieHeader: string, name: string): string {
    const match = cookieHeader.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
    if (!match) throw new Error(`Cookie ${name} absent`);
    return match.slice(name.length + 1);
}

/** Inscrit un utilisateur et renvoie un client HTTP connecté en son nom */
export async function createUser(target: Parameters<typeof request.agent>[0] = app): Promise<TestUser> {
    const username = `user${++userCounter}`;
    const email = `${username}@test.com`;
    const agent = request.agent(target);

    const res = await agent
        .post('/api/auth/signup')
        .send({ email, password: PASSWORD, username })
        .expect(201);

    return {
        agent,
        id: res.body.data.id,
        email,
        username,
        cookie: toCookieHeader(res.headers['set-cookie']),
    };
}

export async function createServer(user: TestUser, name = 'Mon serveur'): Promise<string> {
    const res = await user.agent.post('/api/server').send({ name }).expect(201);
    return res.body.data.server._id;
}

export async function createChannel(
    user: TestUser,
    serverId: string,
    name = 'général',
    type: 'text' | 'voice' = 'text'
): Promise<string> {
    const res = await user.agent.post('/api/channel').send({ name, serverId, type }).expect(201);
    return res.body.data._id;
}

export async function createInvitation(
    user: TestUser,
    serverId: string,
    options: { maxUsage?: number; expiredAt?: string } = {}
): Promise<string> {
    const res = await user.agent.post('/api/invitation').send({ serverId, ...options }).expect(201);
    return res.body.data.code;
}

/** Crée une invitation puis la fait utiliser par `user` */
export async function joinServer(owner: TestUser, user: TestUser, serverId: string): Promise<void> {
    const code = await createInvitation(owner, serverId);
    await user.agent.post('/api/invitation/join').send({ code }).expect(200);
}

/** Rend deux utilisateurs amis et renvoie l'identifiant de leur conversation privée */
export async function befriend(a: TestUser, b: TestUser): Promise<{ friendshipId: string; conversationId: string }> {
    const request = await a.agent.post('/api/friend/request').send({ username: b.username }).expect(201);
    const friendshipId: string = request.body.data._id;
    await b.agent.post(`/api/friend/${friendshipId}/accept`).expect(200);

    return { friendshipId, conversationId: [a.id, b.id].sort().join('_') };
}
