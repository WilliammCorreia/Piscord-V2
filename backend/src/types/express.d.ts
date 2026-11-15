import type { AuthUser } from './auth.ts';

declare global {
    namespace Express {
        interface Request {
            /** Renseigné par le middleware requireAuth */
            user?: AuthUser;
        }
    }
}

export {};
