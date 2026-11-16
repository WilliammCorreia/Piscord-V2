import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PresenceService } from '../../../core/services/presence.service';
import { AuthService } from '../../auth/services/auth.service';
import { Message } from '../../server/models/message.model';
import { SocketService } from '../../server/services/socketio/socket.service';
import {
  Friend,
  FriendListResponse,
  FriendRequest,
  FriendRequestTarget,
  FriendshipResponse,
  Relation
} from '../models/friend.model';

/**
 * Amis, demandes en attente et messages privés non lus.
 * Le service garde la liste à jour : il la recharge à chaque connexion du socket
 * et dès que le serveur signale un changement.
 */
@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/friend`;

  friends: Friend[] = [];
  incoming: FriendRequest[] = [];
  outgoing: FriendRequest[] = [];

  /** Conversation privée -> nombre de messages reçus depuis sa dernière ouverture (non conservé au rechargement) */
  private readonly unread = new Map<string, number>();
  private activeConversationId: string | null = null;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private presenceService: PresenceService,
    private authService: AuthService
  ) {
    // À la connexion, puis après chaque reconnexion : on a pu manquer des changements
    this.socketService.listen<void>('connect').subscribe(() => this.load());
    this.socketService.listen<void>('friends-changed').subscribe(() => this.load());
    this.socketService.listen<Message>('message').subscribe((message) => this.onMessage(message));

    // Déconnexion de l'utilisateur : rien ne doit rester pour le suivant
    this.socketService.listen<void>('disconnect').subscribe(() => {
      if (!this.authService.user) {
        this.reset();
      }
    });
  }

  /**
   * Recharge les amis et les demandes en attente
   */
  load(): void {
    this.http.get<FriendListResponse>(this.apiUrl).subscribe({
      next: (res) => {
        this.friends = res.data.friends;
        this.incoming = res.data.incoming;
        this.outgoing = res.data.outgoing;
        this.presenceService.setMany(res.data.friends.map((friend) => friend.user));
      },
      error: (err) => console.error("Erreur lors du chargement des amis: ", err)
    });
  }

  /**
   * Envoie une demande d'ami, par pseudo ou par identifiant
   */
  sendRequest(target: FriendRequestTarget): Observable<FriendshipResponse> {
    return this.http.post<FriendshipResponse>(`${this.apiUrl}/request`, target).pipe(tap(() => this.load()));
  }

  /**
   * Accepte une demande reçue
   */
  accept(friendshipId: string): Observable<FriendshipResponse> {
    return this.http.post<FriendshipResponse>(`${this.apiUrl}/${friendshipId}/accept`, null).pipe(tap(() => this.load()));
  }

  /**
   * Refuse ou annule une demande, ou retire un ami
   */
  remove(friendshipId: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${friendshipId}`).pipe(tap(() => this.load()));
  }

  /**
   * Lien avec un utilisateur : sert à savoir s'il faut proposer « Ajouter en ami »
   */
  relationWith(userId: string): Relation {
    if (userId === this.authService.user?.id) return 'self';
    if (this.friends.some((friend) => friend.user._id === userId)) return 'friend';
    if (this.incoming.some((request) => request.user._id === userId)) return 'incoming';
    if (this.outgoing.some((request) => request.user._id === userId)) return 'outgoing';
    return 'none';
  }

  friendByConversation(conversationId: string): Friend | undefined {
    return this.friends.find((friend) => friend.conversationId === conversationId);
  }

  /**
   * Signale quelle conversation privée est affichée : ses messages ne comptent pas comme non lus
   */
  setActiveConversation(conversationId: string | null): void {
    this.activeConversationId = conversationId;
    if (conversationId) {
      this.unread.delete(conversationId);
    }
  }

  unreadCount(conversationId: string): number {
    return this.unread.get(conversationId) ?? 0;
  }

  /** Ce qui attend l'utilisateur : demandes reçues et messages privés non lus */
  get pendingCount(): number {
    let total = this.incoming.length;
    this.unread.forEach((count) => { total += count; });
    return total;
  }

  private onMessage(message: Message): void {
    const isFromFriend = this.friends.some((friend) => friend.conversationId === message.referenceId);
    const isMine = message.authorId._id === this.authService.user?.id;

    if (isFromFriend && !isMine && message.referenceId !== this.activeConversationId) {
      this.unread.set(message.referenceId, this.unreadCount(message.referenceId) + 1);
    }
  }

  private reset(): void {
    this.friends = [];
    this.incoming = [];
    this.outgoing = [];
    this.unread.clear();
    this.activeConversationId = null;
  }
}
