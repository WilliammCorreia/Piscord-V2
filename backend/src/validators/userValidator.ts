import { body } from 'express-validator';

/**
 * Validateurs pour les données utilisateur
 * Contient les règles de validation pour l'inscription
 * (mêmes règles que le formulaire Angular : un mot de passe accepté par l'un l'est par l'autre)
 */
export const validateSignup = [
    body('email')
        .isString()
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("Format d'email invalide")
        .isLength({ max: 64 })
        .withMessage("L'email doit contenir au maximum 64 caractères"),

    body('password')
        .isString()
        .isLength({ min: 12, max: 64 })
        .withMessage('Le mot de passe doit contenir entre 12 et 64 caractères')
        .matches(/[a-z]/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule')
        .matches(/[A-Z]/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule')
        .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial')
        .matches(/\d/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/^\S+$/)
        .withMessage("Le mot de passe ne doit pas contenir d'espaces"),

    body('username')
        .isString()
        .trim()
        .isLength({ min: 1, max: 24 })
        .withMessage("Le nom d'utilisateur doit contenir entre 1 et 24 caractères")
        .matches(/^\S+$/)
        .withMessage("Le nom d'utilisateur ne doit pas contenir d'espaces"),
];

/**
 * Validateurs pour les données utilisateur
 * Contient les règles de validation pour la connexion
 */
export const validateSignin = [
    body('email')
        .isString()
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("Format d'email invalide"),

    body('password')
        .isString()
        .isLength({ min: 1, max: 64 })
        .withMessage('Le mot de passe doit contenir entre 1 et 64 caractères'),
];
