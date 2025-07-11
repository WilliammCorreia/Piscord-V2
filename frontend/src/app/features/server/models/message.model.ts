export interface Author {
    _id: string;
    username: string;
}

export interface Message {
    content: string;
    authorId: Author;
    referenceId: string;
    isDeleted: boolean;
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number
}

export interface Chat {
    content: string;
    author: string;
    isDeleted: boolean;
    updatedAt: Date;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  message: string;
}

export interface MessageResponse {
    success: boolean;
    data: Message;
    message: string;
}

// Errors
export interface ErrorResponse {
  success: boolean;
  erreur?: string;
  message?: string;
}