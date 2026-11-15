import type { Request, RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/AppError.ts';
import AuthService from '../services/AuthService.ts';
import type { AuthUser } from '../types/auth.ts';
import { clearAuthCookies, setAccessCookie } from '../utils/cookies.ts';

/**
 * Middleware d'authentification avec auto-refresh
 * Vérifie le token d'accès et tente un refresh automatique s'il est expiré
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
    try {
        const { user, newAccessToken } = await AuthService.authenticate(
            req.cookies?.accessToken,
            req.cookies?.refreshToken
        );

        if (newAccessToken) {
            setAccessCookie(res, newAccessToken);
        }

        req.user = user;
        next();
    }
    catch (err) {
        // Session inutilisable : on retire les cookies pour que le client reparte proprement
        if (err instanceof UnauthorizedError) {
            clearAuthCookies(res);
        }
        next(err);
    }
};

/**
 * Récupère l'utilisateur authentifié d'une requête passée par requireAuth
 * @throws {UnauthorizedError} Si la route n'est pas protégée par requireAuth
 */
export function getAuthUser(req: Request): AuthUser {
    if (!req.user) {
        throw new UnauthorizedError("Token d'accès manquant", 'TOKEN_MISSING');
    }
    return req.user;
}
