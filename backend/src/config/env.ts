import 'dotenv/config';

/**
 * Lit une variable d'environnement obligatoire
 * @throws {Error} Si la variable est absente : le serveur ne doit pas démarrer à moitié configuré
 */
function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variable d'environnement manquante : ${name}`);
    }
    return value;
}

/** Transforme "a, b,c" en ["a", "b", "c"] */
function list(value: string | undefined): string[] {
    return (value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

const jwtSecret = required('JWT_SECRET');

/**
 * Configuration de l'application, lue une seule fois au démarrage
 */
export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    mongodbUri: required('MONGODB_URI'),
    jwtSecret,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || jwtSecret,
    corsOrigins: list(process.env.CORS_ORIGINS ?? process.env.REVERSE_PROXY_ADDRESS),
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
} as const;

if (env.nodeEnv === 'production' && jwtSecret.length < 32) {
    console.warn('JWT_SECRET fait moins de 32 caractères : utilisez un secret plus long en production.');
}
