import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
    export interface ProvidedContext {
        mongoUri: string;
    }
}

/**
 * Démarre un MongoDB en mémoire, partagé par tous les fichiers de test.
 * Chaque fichier y utilise sa propre base (voir setup.ts).
 */
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
    const mongod = await MongoMemoryServer.create();
    project.provide('mongoUri', mongod.getUri());

    return async () => {
        await mongod.stop();
    };
}
