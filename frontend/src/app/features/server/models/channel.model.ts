import { ApiResponse } from '../../../core/models/api.model';

export interface Channel {
  _id: string;
  name: string;
  serverId: string;
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Requests
export interface CreateChannelRequest {
  name: string;
  serverId: string;
  roleIds?: string[];
}

// Responses
export type ChannelsResponse = ApiResponse<Channel[]>;

export type CreateChannelResponse = ApiResponse<Channel>;
