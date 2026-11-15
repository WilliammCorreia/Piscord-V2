import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env.ts';
import { handleErrors, handleNotFound } from './middleware/errorHandlers.ts';
import routes from './routes/index.ts';

/**
 * Construit l'application Express, sans la démarrer.
 * Séparé de server.ts pour pouvoir la tester sans ouvrir de port.
 */
export function createApp(): Express {
    const app = express();

    // Derrière nginx : l'adresse du client se lit dans X-Forwarded-For (utile au rate limiting)
    app.set('trust proxy', 1);

    app.use(helmet());

    // Derrière le reverse proxy tout est en même origine : CORS n'est activé que si
    // des origines sont explicitement déclarées.
    if (env.corsOrigins.length > 0) {
        app.use(cors({
            origin: env.corsOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
    }

    app.use(express.json({ limit: '100kb' }));
    app.use(cookieParser());

    app.get('/api/ping', (_req, res) => {
        res.json({ success: true, message: 'pong' });
    });

    app.use('/api', routes);

    app.use(handleNotFound);
    app.use(handleErrors);

    return app;
}
