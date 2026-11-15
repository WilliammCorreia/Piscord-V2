/** Utilisateur authentifié, tel qu'il est attaché à la requête ou au socket */
export interface AuthUser {
    userId: string;
    email: string;
    username: string;
}

/** Données utilisateur renvoyées au client (jamais le hash du mot de passe) */
export interface PublicUser {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    displayStatus?: boolean;
    lastConnection?: Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
