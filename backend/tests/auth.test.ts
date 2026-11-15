import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { User } from '../src/models/User.ts';
import { PASSWORD, app, cookieValue, createUser, toCookieHeader } from './helpers.ts';

const JWT_SECRET = process.env['JWT_SECRET'] as string;

describe('Inscription', () => {
    it('crée le compte et pose des cookies httpOnly', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'Alice@Test.com', password: PASSWORD, username: 'alice' })
            .expect(201);

        expect(res.body.data).toMatchObject({ email: 'alice@test.com', username: 'alice' });
        expect(res.body.data.id).toEqual(expect.any(String));
        expect(JSON.stringify(res.body)).not.toContain('hashPassword');

        const cookies = res.headers['set-cookie'] as unknown as string[];
        expect(cookies).toHaveLength(2);
        for (const cookie of cookies) {
            expect(cookie).toMatch(/^(accessToken|refreshToken)=/);
            expect(cookie).toContain('HttpOnly');
            expect(cookie).toContain('SameSite=Strict');
        }
    });

    it('ne stocke jamais le mot de passe en clair', async () => {
        const user = await createUser();

        const stored = await User.findById(user.id);

        expect(stored?.hashPassword).toMatch(/^\$2[aby]\$/);
        expect(stored?.hashPassword).not.toContain(PASSWORD);
    });

    it('refuse un email déjà utilisé, même avec une casse différente', async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({ email: 'bob@test.com', password: PASSWORD, username: 'bob' })
            .expect(201);

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'BOB@test.com', password: PASSWORD, username: 'bob2' })
            .expect(409);

        expect(res.body).toMatchObject({ success: false, code: 'EMAIL_TAKEN' });
    });

    it.each([
        ['trop court', 'Abc-123!'],
        ['sans majuscule', 'motdepasse-123!'],
        ['sans chiffre', 'Motdepasse-abc!'],
        ['sans caractère spécial', 'Motdepasse1234'],
        ['avec un espace', 'Mot depasse-123!'],
    ])('refuse un mot de passe %s', async (_cas, password) => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'carol@test.com', password, username: 'carol' })
            .expect(400);

        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('accepte les caractères spéciaux admis par le formulaire Angular', async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({ email: 'dave@test.com', password: 'Motdepasse_1234', username: 'dave' })
            .expect(201);
    });
});

describe('Connexion', () => {
    it("connecte l'utilisateur quelle que soit la casse de l'email", async () => {
        const user = await createUser();

        const res = await request(app)
            .post('/api/auth/signin')
            .send({ email: user.email.toUpperCase(), password: PASSWORD })
            .expect(200);

        expect(res.body.data).toMatchObject({ id: user.id, email: user.email });
    });

    it('répond de la même façon pour un email inconnu et un mauvais mot de passe', async () => {
        const user = await createUser();

        const wrongPassword = await request(app)
            .post('/api/auth/signin')
            .send({ email: user.email, password: 'Mauvais-motdepasse-1!' })
            .expect(401);
        const unknownEmail = await request(app)
            .post('/api/auth/signin')
            .send({ email: 'inconnu@test.com', password: PASSWORD })
            .expect(401);

        expect(wrongPassword.body.code).toBe('INVALID_CREDENTIALS');
        expect(unknownEmail.body).toEqual(wrongPassword.body);
    });
});

describe('Session', () => {
    it('refuse une route protégée sans cookie', async () => {
        const res = await request(app).get('/api/server/user').expect(401);

        expect(res.body.code).toBe('TOKEN_MISSING');
    });

    it('refuse un token à la signature invalide', async () => {
        const forged = jwt.sign({ userId: '000000000000000000000000', type: 'access' }, 'mauvais-secret');

        const res = await request(app)
            .get('/api/server/user')
            .set('Cookie', `accessToken=${forged}`)
            .expect(401);

        expect(res.body.code).toBe('TOKEN_INVALID');
    });

    it("refuse un refresh token présenté comme token d'accès", async () => {
        const user = await createUser();
        const refreshToken = cookieValue(user.cookie, 'refreshToken');

        await request(app)
            .get('/api/server/user')
            .set('Cookie', `accessToken=${refreshToken}`)
            .expect(401);
    });

    it("renouvelle le token d'accès expiré grâce au refresh token", async () => {
        const user = await createUser();
        const expired = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, type: 'access' },
            JWT_SECRET,
            { expiresIn: -10 }
        );

        const res = await request(app)
            .get('/api/server/user')
            .set('Cookie', `accessToken=${expired}; refreshToken=${cookieValue(user.cookie, 'refreshToken')}`)
            .expect(200);

        const renewed = (res.headers['set-cookie'] as unknown as string[]).find((c) => c.startsWith('accessToken='));
        expect(renewed).toContain('HttpOnly');
        expect(cookieValue(toCookieHeader(renewed), 'accessToken')).not.toBe(expired);
    });

    it('la déconnexion révoque le refresh token', async () => {
        const user = await createUser();
        const refreshOnly = `refreshToken=${cookieValue(user.cookie, 'refreshToken')}`;

        // Avant : le refresh token seul suffit à rouvrir une session
        await request(app).get('/api/server/user').set('Cookie', refreshOnly).expect(200);

        await user.agent.post('/api/auth/disconnect').expect(204);

        // Après : le même refresh token, rejoué par quelqu'un qui l'aurait copié, est refusé
        const res = await request(app).get('/api/server/user').set('Cookie', refreshOnly).expect(401);
        expect(res.body.code).toBe('REFRESH_FAILED');
    });
});
