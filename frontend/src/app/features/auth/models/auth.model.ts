import { ApiResponse } from '../../../core/models/api.model';

export interface UserData {
  id: string;
  email: string;
  username: string;
}

// Requests
export interface SigninRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

// Responses
export type SigninResponse = ApiResponse<UserData>;

export type SignupResponse = ApiResponse<UserData>;
