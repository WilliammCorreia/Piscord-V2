import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  /**
   * Ouvre la connexion à la première utilisation.
   * Le serveur authentifie le socket avec les cookies de session : il faut donc
   * l'ouvrir après la connexion de l'utilisateur, et le fermer à sa déconnexion.
   */
  private getSocket(): Socket {
    if (!this.socket) {
      const options = {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000
      };

      // Sans adresse explicite, socket.io se connecte à l'origine de la page (reverse proxy)
      this.socket = environment.BACKEND_ADDRESS
        ? io(environment.BACKEND_ADDRESS, options)
        : io(options);
    }

    return this.socket;
  }

  emit(eventName: string, data: unknown): void {
    this.getSocket().emit(eventName, data);
  }

  /**
   * Écoute un événement du socket
   * @returns Observable qui retire son écouteur du socket au désabonnement
   */
  listen<T>(eventName: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const socket = this.getSocket();
      const handler = (data: T) => subscriber.next(data);

      socket.on(eventName, handler);

      return () => socket.off(eventName, handler);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
