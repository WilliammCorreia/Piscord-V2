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

/**
 * Lit un entier positif ou nul
 * @throws {Error} Si la valeur n'est pas un entier : une faute de frappe ne doit pas passer inaperçue
 */
function count(name: string, fallback: number): number {
    const raw = process.env[name];
    if (raw === undefined || raw.trim() === '') {
        return fallback;
    }

    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`Variable d'environnement invalide : ${name} doit être un entier positif ou nul`);
    }
    return value;
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
    trustProxyHops: count('TRUST_PROXY_HOPS', 1),
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
} as const;

if (env.nodeEnv === 'production' && jwtSecret.length < 32) {
    console.warn('JWT_SECRET fait moins de 32 caractères : utilisez un secret plus long en production.');
}
