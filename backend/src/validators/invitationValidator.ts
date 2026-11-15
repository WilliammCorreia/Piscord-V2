import { body } from 'express-validator';

export const validateCreateInvitation = [
    body('serverId')
        .isMongoId()
        .withMessage('Identifiant de serveur invalide'),

    body('expiredAt')
        .optional({ values: 'null' })
        .isISO8601()
        .withMessage("La date d'expiration est invalide")
        .toDate(),

    body('maxUsage')
        .optional({ values: 'null' })
        .isInt({ min: 1, max: 100000 })
        .withMessage("Le nombre maximum d'utilisations doit être un entier positif")
        .toInt(),
];

/** Les codes sont générés en majuscules : on accepte une saisie en minuscules */
export const validateInvitationCode = [
    body('code')
        .isString()
        .trim()
        .toUpperCase()
        .isLength({ min: 6, max: 32 })
        .withMessage("Code d'invitation requis"),
];
