import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.ts';

/**
 * Réponse pour les routes inexistantes
 */
export const handleNotFound: RequestHandler = (_req, res) => {
    res.status(404).json({
        success: false,
        code: 'ROUTE_NOT_FOUND',
        message: 'Route introuvable',
    });
};

/**
 * Middleware d'erreurs central : seul endroit où une erreur devient une réponse HTTP.
 * Express 5 y transmet automatiquement les erreurs des handlers async, les contrôleurs
 * n'ont donc pas besoin de try/catch.
 */
export const handleErrors: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        res.status(err.status).json({ success: false, code: err.code, message: err.message });
        return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: err.message });
        return;
    }

    if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ success: false, code: 'INVALID_ID', message: 'Identifiant invalide' });
        return;
    }

    // Erreurs levées par express.json() : corps illisible ou trop volumineux
    const bodyError = err as { type?: string };
    if (bodyError.type === 'entity.parse.failed') {
        res.status(400).json({ success: false, code: 'INVALID_JSON', message: 'Corps de requête invalide' });
        return;
    }
    if (bodyError.type === 'entity.too.large') {
        res.status(413).json({ success: false, code: 'PAYLOAD_TOO_LARGE', message: 'Requête trop volumineuse' });
        return;
    }

    // Erreur inattendue : on la journalise, mais le client n'en voit pas le détail
    console.error(err);
    res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
    });
};
