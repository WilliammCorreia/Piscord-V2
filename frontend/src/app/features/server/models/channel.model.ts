import { ApiResponse } from '../../../core/models/api.model';

export type ChannelType = 'text' | 'voice';

export interface VoiceParticipant {
  userId: string;
  username: string;
}

export interface Channel {
  _id: string;
  name: string;
  serverId: string;
  /** Absent sur les salons créés avant l'arrivée du vocal : ils sont textuels */
  type?: ChannelType;
  /** Salons vocaux uniquement : qui s'y trouve au moment de la réponse */
  participants?: VoiceParticipant[];
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Requests
export interface CreateChannelRequest {
  name: string;
  serverId: string;
  type?: ChannelType;
  roleIds?: string[];
}

// Responses
export type ChannelsResponse = ApiResponse<Channel[]>;

export type CreateChannelResponse = ApiResponse<Channel>;
