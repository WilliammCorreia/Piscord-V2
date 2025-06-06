const { body } = require("express-validator");

/**
 * Validateurs pour les données utilisateur
 * Contient les règles de validation pour l'inscription et autres opérations utilisateur
 */
exports.validateSignup = [
    body("email")
        .isEmail()
        .withMessage("Format d'email invalide"),
    
    body("password")
        .isLength({ min: 12, max: 64 })
        .withMessage("Le mot de passe doit contenir entre 12 et 64 caractères")
        .matches(/[a-z]/)
        .withMessage("Le mot de passe doit contenir au moins une minuscule")
        .matches(/[A-Z]/)
        .withMessage("Le mot de passe doit contenir au moins une majuscule")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Le mot de passe doit contenir au moins un caractère spécial")
        .matches(/\d/)
        .withMessage("Le mot de passe doit contenir au moins un chiffre"),
    
    body("username")
        .isLength({ min: 1, max: 24 })
        .withMessage("Le nom d'utilisateur doit contenir entre 1 et 24 caractères"),
];