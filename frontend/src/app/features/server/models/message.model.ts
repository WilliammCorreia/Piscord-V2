import { ApiResponse } from '../../../core/models/api.model';

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
    createdAt: Date | string;
    updatedAt: Date | string;
    __v: number
}

// Requests
export interface CreateMessageRequest {
    content: string;
    referenceId: string;
}

// Responses
export type MessagesResponse = ApiResponse<Message[]> & {
    /** true s'il reste des messages plus anciens à charger */
    hasMore: boolean;
};

export type MessageResponse = ApiResponse<Message>;

// Événements Socket.io
export interface TypingEvent {
    username: string;
    channelId: string;
}

export interface MessageDeletedEvent {
    _id: string;
    referenceId: string;
}
