import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { ConflictError, UnauthorizedError } from '../errors/AppError.ts';
import type { UserDocument } from '../models/User.ts';
import UserRepository from '../repositories/UserRepository.ts';
import type { AuthTokens, AuthUser, PublicUser } from '../types/auth.ts';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

interface AccessTokenPayload extends AuthUser {
    type: 'access';
}

interface RefreshTokenPayload {
    userId: string;
    tokenVersion: number;
    type: 'refresh';
}

/**
 * Hash factice comparé quand l'email est inconnu : la réponse prend le même temps
 * que pour un mot de passe incorrect, ce qui évite de révéler quels emails existent.
 */
const DUMMY_HASH = bcrypt.hashSync('piscord-dummy-password', env.bcryptRounds);

/**
 * Vérifie un JWT et s'assure qu'il est du type attendu.
 * Le champ `type` empêche d'utiliser un refresh token comme access token, et inversement.
 * @throws {jwt.JsonWebTokenError} Si le token est invalide, expiré ou du mauvais type
 */
function verifyToken<T extends { type: string }>(token: string, secret: string, type: T['type']): T {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || payload['type'] !== type) {
        throw new jwt.JsonWebTokenError('Type de token invalide');
    }
    return payload as unknown as T;
}

function toAuthUser(user: UserDocument): AuthUser {
    return { userId: user.id as string, email: user.email, username: user.username };
}

function toPublicUser(user: UserDocument): PublicUser {
    return {
        id: user.id as string,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        displayStatus: user.displayStatus,
        lastConnection: user.lastConnection,
    };
}

/**
 * Service d'authentification
 * Gère l'inscription, la connexion et le cycle de vie des tokens
 */
class AuthService {

    /**
     * Génère un access token (15 minutes) pour un utilisateur
     */
    signAccessToken(user: UserDocument): string {
        const payload: AccessTokenPayload = { ...toAuthUser(user), type: 'access' };
        return jwt.sign(payload, env.jwtSecret, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
    }

    /**
     * Génère un refresh token (7 jours) lié à la version de token de l'utilisateur
     */
    signRefreshToken(user: UserDocument): string {
        const payload: RefreshTokenPayload = {
            userId: user.id as string,
            tokenVersion: user.tokenVersion,
            type: 'refresh',
        };
        return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: REFRESH_TOKEN_TTL_SECONDS });
    }

    generateTokens(user: UserDocument): AuthTokens {
        return {
            accessToken: this.signAccessToken(user),
            refreshToken: this.signRefreshToken(user),
        };
    }

    /**
     * Inscrit un nouvel utilisateur
     * @throws {ConflictError} Si l'email ou le pseudo est déjà utilisé
     */
    async signup(data: { email: string; password: string; username: string }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
        const { email, password, username } = data;

        if (await UserRepository.findByEmail(email)) {
            throw new ConflictError('Email déjà utilisé.', 'EMAIL_TAKEN');
        }

        // Le pseudo sert à s'ajouter en ami : deux comptes ne peuvent pas porter le même
        if (await UserRepository.findByUsername(username)) {
            throw new ConflictError('Pseudo déjà utilisé.', 'USERNAME_TAKEN');
        }

        const hashPassword = await bcrypt.hash(password, env.bcryptRounds);

        let user: UserDocument;
        try {
            user = await UserRepository.create({ email, hashPassword, username });
        }
        catch (err) {
            // Deux inscriptions simultanées avec le même email : l'index unique tranche
            if ((err as { code?: number }).code === 11000) {
                throw new ConflictError('Email déjà utilisé.', 'EMAIL_TAKEN');
            }
            throw err;
        }

        return { user: toPublicUser(user), tokens: this.generateTokens(user) };
    }

    /**
     * Connecte un utilisateur existant
     * @throws {UnauthorizedError} Si l'email est inconnu ou le mot de passe incorrect
     *         (même erreur dans les deux cas, pour ne pas révéler quels emails existent)
     */
    async signin(data: { email: string; password: string }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
        const { email, password } = data;

        const user = await UserRepository.findByEmail(email);
        const match = await bcrypt.compare(password, user?.hashPassword ?? DUMMY_HASH);

        if (!user || !match) {
            throw new UnauthorizedError('Email ou mot de passe incorrect.', 'INVALID_CREDENTIALS');
        }

        user.lastConnection = new Date();
        await UserRepository.touchLastConnection(user.id as string);

        return { user: toPublicUser(user), tokens: this.generateTokens(user) };
    }

    /**
     * Identifie l'utilisateur à partir de ses cookies.
     * Si l'access token est absent ou expiré, tente un rafraîchissement avec le refresh token.
     * Utilisé à la fois par le middleware HTTP et par la connexion Socket.io.
     * @returns L'utilisateur, et un nouvel access token s'il a fallu rafraîchir
     * @throws {UnauthorizedError} Si aucun token valide n'est présenté
     */
    async authenticate(accessToken?: string, refreshToken?: string): Promise<{ user: AuthUser; newAccessToken?: string }> {
        if (accessToken) {
            try {
                const { userId, email, username } = verifyToken<AccessTokenPayload>(accessToken, env.jwtSecret, 'access');
                return { user: { userId, email, username } };
            }
            catch (err) {
                // Seule l'expiration ouvre droit au refresh ; une signature invalide est rejetée
                if (!(err instanceof jwt.TokenExpiredError)) {
                    throw new UnauthorizedError('Token invalide', 'TOKEN_INVALID');
                }
            }
        }

        if (!refreshToken) {
            throw new UnauthorizedError("Token d'accès manquant", 'TOKEN_MISSING');
        }

        const refreshed = await this.refresh(refreshToken);
        return { user: refreshed.user, newAccessToken: refreshed.accessToken };
    }

    /**
     * Émet un nouvel access token à partir d'un refresh token valide
     * @throws {UnauthorizedError} Si le refresh token est invalide, expiré ou révoqué
     */
    async refresh(refreshToken?: string): Promise<{ user: AuthUser; accessToken: string }> {
        const failure = new UnauthorizedError('Reconnexion requise', 'REFRESH_FAILED');

        if (!refreshToken) throw failure;

        let payload: RefreshTokenPayload;
        try {
            payload = verifyToken<RefreshTokenPayload>(refreshToken, env.jwtRefreshSecret, 'refresh');
        }
        catch {
            throw failure;
        }

        const user = await UserRepository.findById(payload.userId);
        if (!user || user.tokenVersion !== payload.tokenVersion) throw failure;

        return { user: toAuthUser(user), accessToken: this.signAccessToken(user) };
    }

    /**
     * Révoque les refresh tokens de l'utilisateur (déconnexion sur tous ses appareils)
     * @returns L'ID de l'utilisateur déconnecté, ou null si le refresh token n'était pas valide
     */
    async logout(refreshToken?: string): Promise<string | null> {
        if (!refreshToken) return null;

        try {
            const { userId } = verifyToken<RefreshTokenPayload>(refreshToken, env.jwtRefreshSecret, 'refresh');
            await UserRepository.incrementTokenVersion(userId);
            return userId;
        }
        catch {
            return null;
        }
    }
}

export default new AuthService();
