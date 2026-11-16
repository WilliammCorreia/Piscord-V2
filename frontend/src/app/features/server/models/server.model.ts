import { ApiResponse } from '../../../core/models/api.model';

export interface Member {
    _id: string;
    username: string;
    /** Statut de connexion au moment de la réponse ; les changements arrivent ensuite par le socket */
    online?: boolean;
}

/** Événement Socket.io : un nouveau membre a rejoint un serveur */
export interface MemberJoinedEvent {
    serverId: string;
    member: Required<Member>;
}

export interface Server {
    _id: string;
    name: string;
    ownerId: string;
    memberIds: Member[];
    bannedIds: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Requests
export interface CreateServerRequest {
    name: string;
}

export interface JoinServerRequest {
    code: string;
}

// Responses
export type ServersResponse = ApiResponse<Server[]>;

export type ServerResponse = ApiResponse<Server>;

export type CreateServerResponse = ApiResponse<{ server: Pick<Server, '_id' | 'name'> }>;

export type JoinServerResponse = ApiResponse<{ server: Server }>;
