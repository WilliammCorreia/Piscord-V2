import { body } from 'express-validator';

export const validateCreateChannel = [
    body('name')
        .isString()
        .trim()
        .isLength({ min: 3, max: 24 })
        .withMessage('Le nom du salon doit contenir entre 3 et 24 caractères'),

    body('serverId')
        .isMongoId()
        .withMessage('Identifiant de serveur invalide'),

    body('type')
        .optional()
        .isIn(['text', 'voice'])
        .withMessage('Le type de salon doit être "text" ou "voice"'),

    body('roleIds')
        .optional()
        .isArray({ max: 50 })
        .withMessage('roleIds doit être une liste'),

    body('roleIds.*')
        .isString()
        .withMessage('Chaque rôle doit être un identifiant'),
];
