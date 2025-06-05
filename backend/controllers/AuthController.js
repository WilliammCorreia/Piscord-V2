const AuthService = require("../services/AuthService");

class AuthController {

    
    async test(req, res) {
        return res.status(201).json({ "message": "Inscription réussit" });
    }


    async signup(req, res) {
        try {
            const signupData = req.body;
            const newUser = await AuthService.signup(signupData);

            return res.status(201).json({ 
                success: true,
                data: newUser,
                message: "Utilisateur créé." 
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                erreur: "erreur : Erreur lors de l'inscription. "
            });
        }
    };
}

module.exports = new AuthController();