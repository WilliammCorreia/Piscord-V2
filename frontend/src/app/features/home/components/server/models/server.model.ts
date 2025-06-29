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

export interface UserServersResponse {
    success: boolean;
    data: Server[];
    message: string;
}

export interface ErrorResponse {
    success: boolean;
    error: string;
}