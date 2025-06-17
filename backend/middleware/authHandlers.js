const jwt = require("jsonwebtoken");
const AuthService = require("../services/AuthService");

/**
 * Middleware d'authentification avec auto-refresh
 * Vérifie le token d'accès et tente un refresh automatique si expiré
 */
exports.handleAuthErrors = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
        return res.status(401).json({
            success: false,
            code: "TOKEN_MISSING",
            message: "Token d'accès manquant"
        });
    }
    
    try {
        jwt.verify(accessToken, process.env.JWT_SECRET);
        return next();
    }
    catch (err) {
        console.log("Erreur JWT:", err.message);
        
        if (err.name === "TokenExpiredError") {
            try {
                console.log("1.");
                const newAccessToken = await AuthService.refresh(req.cookies.refreshToken);
                console.log("2.");

                if (newAccessToken) {
                    console.log("3.");

                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'strict'
                    });
                    console.log("4.");

                    jwt.verify(newAccessToken, process.env.JWT_SECRET);
                    console.log("5.");

                    return next();
                } 
                else {
                    console.log("6.");
                    res.clearCookie("accessToken");
                    res.clearCookie("refreshToken");
                    console.log("7.");
                    return res.status(401).json({
                        success: false,
                        code: "REFRESH_FAILED",
                        message: "Reconnexion requise"
                    });
                }
            }
            catch (refreshErr) {
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                console.log(refreshErr);
                
                return res.status(401).json({
                    success: false,
                    code: "REFRESH_ERROR",
                    message: "Erreur lors du refresh"
                });
            }
        }
        else {
            res.status(401).json({
                success: false,
                code: "TOKEN_INVALID",
                message: "Token invalide"
            });
        }
    }
};