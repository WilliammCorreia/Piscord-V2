/**
 * Erreur métier portant son statut HTTP et un code stable.
 * Les services lèvent ces erreurs ; le middleware d'erreurs les traduit en réponse JSON.
 */
export class AppError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.name = new.target.name;
        this.status = status;
        this.code = code;
    }
}

export class BadRequestError extends AppError {
    constructor(message: string, code = 'BAD_REQUEST') {
        super(400, code, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string, code = 'UNAUTHORIZED') {
        super(401, code, message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string, code = 'FORBIDDEN') {
        super(403, code, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, code = 'NOT_FOUND') {
        super(404, code, message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string, code = 'CONFLICT') {
        super(409, code, message);
    }
}
