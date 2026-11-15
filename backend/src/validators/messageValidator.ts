import { body, param, query } from 'express-validator';
import { isReferenceId } from '../services/AccessService.ts';

/** Un message vise un salon (ID) ou une conversation privée (clé de la paire d'amis) */
const isReference = (value: unknown) => isReferenceId(value);

export const validateCreateMessage = [
    body('content')
        .isString()
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Le message doit contenir entre 1 et 2000 caractères'),

    body('referenceId')
        .custom(isReference)
        .withMessage('Identifiant de salon ou de conversation invalide'),
];

export const validateGetMessages = [
    param('referenceId')
        .custom(isReference)
        .withMessage('Identifiant de salon ou de conversation invalide'),

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
