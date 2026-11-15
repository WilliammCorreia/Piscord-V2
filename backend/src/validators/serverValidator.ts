import { body, param } from 'express-validator';

export const validateCreateServer = [
    body('name')
        .isString()
        .trim()
        .isLength({ min: 3, max: 24 })
        .withMessage('Le nom du serveur doit contenir entre 3 et 24 caractères'),
];

export const validateServerIdParam = [
    param('serverId')
        .isMongoId()
        .withMessage('Identifiant de serveur invalide'),
];
