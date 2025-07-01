export interface Server {
    _id: string;
    name: string;
    ownerId: string;
    memberIds: Object[];
    bannedIds: Object[];
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface User {
    _id: string;
    email: string;
    username: string;
    serverIds: Object[];
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface ServerUser {
    server: Server;
    user: User;
}

export interface UserServersResponse {
    success: boolean;
    data: Server[];
    message: string;
}

export interface CreateServerRequest {
    name: string;
}

export interface CreateServerResponse {
    success: boolean;
    data: ServerUser;
    message: string;
}

export interface ErrorResponse {
    success: boolean;
    error: string;
}