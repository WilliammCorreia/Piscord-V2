import { ApiResponse } from '../../../core/models/api.model';

export interface Invitation {
    _id: string;
    code: string;
    serverId: string;
    createdBy: string;
    isActive: boolean;
    expiredAt?: string;
    maxUsage?: number;
    currentUsage: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// Requests
export interface CreateInvitationRequest {
    serverId: string;
    expiredAt?: string;
    maxUsage?: number;
}

// Responses
export type CreateInvitationResponse = ApiResponse<Invitation>;

export type InvitationsResponse = ApiResponse<Invitation[]>;
