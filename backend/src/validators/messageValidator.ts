import { body, param, query } from 'express-validator';

export const validateCreateMessage = [
    body('content')
        .isString()
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Le message doit contenir entre 1 et 2000 caractères'),

    body('referenceId')
        .isMongoId()
        .withMessage('Identifiant de salon invalide'),
];

export const validateGetMessages = [
    param('referenceId')
        .isMongoId()
        .withMessage('Identifiant de salon invalide'),

    query('before')
        .optional()
        .isMongoId()
        .withMessage('Curseur invalide'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('La limite doit être comprise entre 1 et 100')
        .toInt(),
];

export const validateMessageIdParam = [
    param('messageId')
        .isMongoId()
        .withMessage('Identifiant de message invalide'),
];
