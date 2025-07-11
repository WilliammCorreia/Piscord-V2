export interface UserData {
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
export interface SigninResponse {
  success: boolean;
  data: {
    email: string;
    username: string;
  };
  message: string;
}

export interface SignupResponse {
  success: boolean;
  data: {
    email: string;
    username: string;
  };
  message: string;
}

// Errors
export interface ErrorResponse {
  success: boolean;
  erreur?: string;
  message?: string;
}