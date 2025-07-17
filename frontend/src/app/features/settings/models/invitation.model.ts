export interface Invitation {
    _id: string;
    code: string;
    serverId: string;
    createdBy: string;
    isActive: boolean;
    expiredAt?: Date;
    maxUsage?: number;
    currentUsage: number;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface CreateInvitationRequest {
    serverId: string;
    expiredAt?: string;
    maxUsage?: number;
}

export interface CreateInvitationResponse {
    success: boolean;
    data: Invitation;
    message: string;
}

export interface InvitationsResponse {
    success: boolean;
    data: Invitation[];
    message: string;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
}