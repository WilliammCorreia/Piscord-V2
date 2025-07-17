export interface Channel {
    _id: string;
    name: string;
    serverId: string;
    roleIds: string[];
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export interface CreateChannelRequest {
    name: string;
    serverId: string;
    roleIds?: string[];
}

export interface CreateChannelResponse {
    success: boolean;
    data: Channel;
    message: string;
}

export interface ChannelsResponse {
    success: boolean;
    data: Channel[];
    message: string;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
}
