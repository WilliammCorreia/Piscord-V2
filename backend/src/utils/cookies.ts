import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.ts';
import { REFRESH_TOKEN_TTL_SECONDS } from '../services/AuthService.ts';
import type { AuthTokens } from '../types/auth.ts';

/**
 * Options communes aux cookies d'authentification :
 * - httpOnly : illisibles depuis JavaScript (protection XSS)
 * - sameSite strict : jamais envoyés depuis un autre site (protection CSRF)
 * - secure : piloté par COOKIE_SECURE, à activer dès que le site est en HTTPS
 */
const baseOptions: CookieOptions = {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'strict',
    path: '/',
};

/**
 * Le cookie d'access token vit aussi longtemps que le refresh token : une fois le JWT expiré,
 * le middleware le détecte et le renouvelle. La durée de validité réelle reste celle du JWT.
 */
export function setAccessCookie(res: Response, accessToken: string): void {
    res.cookie('accessToken', accessToken, { ...baseOptions, maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000 });
}

export function setAuthCookies(res: Response, tokens: AuthTokens): void {
    setAccessCookie(res, tokens.accessToken);
    res.cookie('refreshToken', tokens.refreshToken, { ...baseOptions, maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000 });
}

export function clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', baseOptions);
    res.clearCookie('refreshToken', baseOptions);
}
