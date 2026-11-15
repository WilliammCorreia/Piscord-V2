import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.ts';

/**
 * Limite le nombre de tentatives par adresse IP sur les routes sensibles
 * (connexion, inscription, codes d'invitation) pour freiner la force brute.
 */
function createLimiter(limit: number) {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        // Les tests enchaînent les inscriptions depuis la même adresse
        skip: () => env.nodeEnv === 'test',
        handler: (_req, res) => {
            res.status(429).json({
                success: false,
                code: 'TOO_MANY_REQUESTS',
                message: 'Trop de tentatives, veuillez réessayer plus tard.',
            });
        },
    });
}

export const authLimiter = createLimiter(20);
export const invitationLimiter = createLimiter(30);
