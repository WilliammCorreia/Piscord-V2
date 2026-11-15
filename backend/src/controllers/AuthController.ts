import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import AuthService from '../services/AuthService.ts';
import { disconnectUser } from '../socket/index.ts';
import { clearAuthCookies, setAccessCookie, setAuthCookies } from '../utils/cookies.ts';

/**
 * Contrôleur d'authentification
 * Gère les requêtes HTTP liées à l'authentification des utilisateurs.
 * Les erreurs remontent au middleware d'erreurs central.
 */
class AuthController {

    /**
     * Gère l'inscription d'un nouvel utilisateur
     */
    signup = async (req: Request, res: Response): Promise<void> => {
        const signupData = matchedData<{ email: string; password: string; username: string }>(req);

        const result = await AuthService.signup(signupData);
        setAuthCookies(res, result.tokens);

        res.status(201).json({
            success: true,
            data: result.user,
            message: 'Utilisateur créé.',
        });
    };

    /**
     * Gère la connexion d'un utilisateur existant
     */
    signin = async (req: Request, res: Response): Promise<void> => {
        const signinData = matchedData<{ email: string; password: string }>(req);

        const result = await AuthService.signin(signinData);
        setAuthCookies(res, result.tokens);

        res.status(200).json({
            success: true,
            data: result.user,
            message: 'Utilisateur connecté.',
        });
    };

    /**
     * Rafraîchit le token d'accès JWT en utilisant le refresh token
     */
    refresh = async (req: Request, res: Response): Promise<void> => {
        try {
            const { accessToken } = await AuthService.refresh(req.cookies?.refreshToken);
            setAccessCookie(res, accessToken);

            res.status(200).json({
                success: true,
                message: 'Token rafraîchi',
            });
        }
        catch (err) {
            clearAuthCookies(res);
            throw err;
        }
    };

    /**
     * Déconnecte l'utilisateur : révoque ses refresh tokens, ferme ses sockets
     * et supprime les cookies d'authentification
     */
    disconnect = async (req: Request, res: Response): Promise<void> => {
        const userId = await AuthService.logout(req.cookies?.refreshToken);
        if (userId) {
            disconnectUser(userId);
        }

        clearAuthCookies(res);
        res.status(204).end();
    };
}

export default new AuthController();
