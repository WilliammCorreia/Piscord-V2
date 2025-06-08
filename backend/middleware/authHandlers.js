const jwt = require("jsonwebtoken");

exports.handleAuthErrors = (req, res, next) => {

    let accessToken = req.cookies.accessToken;
    
    try {
        accessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    
        if (accessToken.iat >= accessToken.exp) {
            res.status(401).json({
                success: false,
                code: "TOKEN_INVALID",
                message: "Token expiré"
            })
        }

        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            code: "TOKEN_INVALID",
            error: "Token manquant ou invalide"
        })
    }
};