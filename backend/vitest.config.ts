import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        globalSetup: ['tests/globalSetup.ts'],
        setupFiles: ['tests/setup.ts'],
        // Lues par src/config/env.ts ; MONGODB_URI n'est pas utilisée (voir tests/setup.ts)
        env: {
            NODE_ENV: 'test',
            JWT_SECRET: 'secret-de-test-uniquement-ne-pas-utiliser-ailleurs',
            MONGODB_URI: 'mongodb://inutilise-en-test',
            BCRYPT_ROUNDS: '4',
        },
        testTimeout: 15_000,
        // Le premier lancement télécharge le binaire MongoDB
        hookTimeout: 180_000,
    },
});
