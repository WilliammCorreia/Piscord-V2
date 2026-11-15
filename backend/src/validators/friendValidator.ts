import { body, param } from 'express-validator';

/** Une demande d'ami désigne son destinataire par son pseudo, ou par son ID (depuis une liste de membres) */
export const validateFriendRequest = [
    body('username')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 24 })
        .withMessage('Pseudo invalide'),

    body('userId')
        .optional()
        .isMongoId()
        .withMessage("Identifiant d'utilisateur invalide"),

    body()
        .custom((value: { username?: unknown; userId?: unknown } | undefined) =>
            Boolean(value?.username) !== Boolean(value?.userId))
        .withMessage('Indiquez un pseudo ou un identifiant'),
];

export const validateFriendshipIdParam = [
    param('friendshipId')
        .isMongoId()
        .withMessage('Identifiant de relation invalide'),
];
