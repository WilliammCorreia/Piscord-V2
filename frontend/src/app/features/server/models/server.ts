export interface Server {
    _id: string;
    name: string;
    ownerId: string;
    memberIds: Member[];
    bannedIds: Member[];
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface Member {
    _id: string;
    username: string;
}

export interface ServersResponse {
    success: boolean;
    data: Server[];
    message: string;
}

// Errors
export interface ErrorResponse {
  success: boolean;
  erreur?: string;
  message?: string;
}