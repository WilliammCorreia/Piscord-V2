export interface Channel {
  _id: string;
  name: string;
  serverId: string;
  allowedRoleIds: String[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface ChannelsResponse {
  success: boolean;
  data: Channel[];
  message: string;
}

// Errors
export interface ErrorResponse {
  success: boolean;
  erreur?: string;
  message?: string;
}


