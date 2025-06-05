class UserController {

    async create(req, res) {
        try {

            return res.status(201).json({ "message": "Inscription réussit" });
        }
        catch (err) {
            return res.json({ "message": "erreur : Erreur lors de l'inscription" });
        }
    }
}

module.exports = new UserController();