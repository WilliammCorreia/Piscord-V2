import { ApiResponse } from '../../../core/models/api.model';

export interface Friend {
  /** ID de la relation : sert à retirer l'ami */
  _id: string;
  user: {
    _id: string;
    username: string;
    online: boolean;
  };
  /** Identifiant de la conversation privée avec cet ami */
  conversationId: string;
}

export interface FriendRequest {
  /** ID de la demande : sert à l'accepter, la refuser ou l'annuler */
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export interface FriendList {
  friends: Friend[];
  /** Demandes reçues */
  incoming: FriendRequest[];
  /** Demandes envoyées */
  outgoing: FriendRequest[];
}

/** Lien entre l'utilisateur connecté et un autre utilisateur */
export type Relation = 'self' | 'friend' | 'incoming' | 'outgoing' | 'none';

// Requests
export type FriendRequestTarget = { username: string } | { userId: string };

// Responses
export type FriendListResponse = ApiResponse<FriendList>;

export type FriendshipResponse = ApiResponse<{ _id: string; status: 'pending' | 'accepted' }>;
