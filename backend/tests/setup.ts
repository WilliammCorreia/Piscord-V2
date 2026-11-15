import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, inject } from 'vitest';

// Une base par fichier de test : les fichiers s'exécutent en parallèle sans se gêner
beforeAll(async () => {
    await mongoose.connect(inject('mongoUri'), { dbName: `piscord-test-${randomUUID()}` });
});

// Chaque test repart d'une base vide
afterEach(async () => {
    await Promise.all(
        Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({}))
    );
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});
