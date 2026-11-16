import { Injectable } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { SocketService } from '../../features/server/services/socketio/socket.service';

interface PresenceEvent {
  userId: string;
  online: boolean;
}

/**
 * Statut de connexion des utilisateurs que l'on a le droit de voir
 * (membres de ses serveurs et amis).
 *
 * L'état initial vient des réponses de l'API (liste des membres, liste d'amis) ;
 * les changements arrivent ensuite par le socket.
 */
@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private readonly onlineUserIds = new Set<string>();

  constructor(
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.socketService.listen<PresenceEvent>('presence').subscribe((event) => this.set(event.userId, event.online));

    // Sans connexion temps réel on ne sait plus rien du statut des autres
    this.socketService.listen<void>('disconnect').subscribe(() => this.onlineUserIds.clear());
  }

  /**
   * Indique si un utilisateur est connecté.
   * Pour soi-même, c'est l'état de sa propre connexion temps réel qui fait foi.
   */
  isOnline(userId: string): boolean {
    if (userId === this.authService.user?.id) {
      return this.socketService.connected;
    }
    return this.onlineUserIds.has(userId);
  }

  set(userId: string, online: boolean): void {
    if (online) {
      this.onlineUserIds.add(userId);
    } else {
      this.onlineUserIds.delete(userId);
    }
  }

  /** Enregistre le statut d'une liste d'utilisateurs reçue de l'API */
  setMany(users: { _id: string; online: boolean }[]): void {
    for (const user of users) {
      this.set(user._id, user.online);
    }
  }
}
