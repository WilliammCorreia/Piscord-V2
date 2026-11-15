import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware de gestion des erreurs de validation
 * Vérifie les résultats de validation express-validator et retourne les erreurs s'il y en a
 */
export const handleValidationErrors: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const details = errors.array().map((error) => ({
            field: error.type === 'field' ? error.path : undefined,
            message: String(error.msg),
        }));

        res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: details[0]?.message ?? 'Données invalides',
            errors: details,
        });
        return;
    }

    next();
};
