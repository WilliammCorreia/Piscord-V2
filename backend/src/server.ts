import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { createApp } from './app.ts';
import { env } from './config/env.ts';
import { initSocket } from './socket/index.ts';

// On attend la base avant d'écouter : le serveur n'accepte pas de requêtes qu'il ne peut pas servir
try {
    await mongoose.connect(env.mongodbUri);
}
catch (err) {
    console.error('Connexion à MongoDB impossible :', err);
    process.exit(1);
}

const httpServer = createServer(createApp());
const io = initSocket(httpServer);

httpServer.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
});

/** Arrêt propre : `docker stop` envoie SIGTERM */
async function shutdown(): Promise<void> {
    await io.close();
    await mongoose.disconnect();
    process.exit(0);
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
