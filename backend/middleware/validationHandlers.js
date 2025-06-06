const { validationResult } = require('express-validator');

/**
 * Middleware de gestion des erreurs de validation
 * Vérifie les résultats de validation express-validator et retourne les erreurs s'il y en a
 */
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
};