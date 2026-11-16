import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  /** Un flux par événement écouté : les abonnés survivent à une reconnexion ou à un changement de session */
  private readonly events = new Map<string, Subject<unknown>>();

  /**
   * Ouvre la connexion temps réel si elle ne l'est pas déjà.
   * Le serveur authentifie le socket avec les cookies de session : il faut donc
   * l'ouvrir une fois l'utilisateur connecté, et le fermer à sa déconnexion.
   */
  connect(): void {
    if (this.socket) {
      // Connexion refusée auparavant (session expirée) : nouvelle tentative
      if (!this.socket.active) {
        this.socket.connect();
      }
      return;
    }

    const options = {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000
    };

    // Sans adresse explicite, socket.io se connecte à l'origine de la page (reverse proxy)
    const socket = environment.BACKEND_ADDRESS
      ? io(environment.BACKEND_ADDRESS, options)
      : io(options);

    for (const [eventName, subject] of this.events) {
      socket.on(eventName, (data: unknown) => subject.next(data));
    }

    this.socket = socket;
  }

  private getSocket(): Socket {
    this.connect();
    return this.socket as Socket;
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Identifiant du socket courant (il change à chaque reconnexion) */
  get id(): string | undefined {
    return this.socket?.id;
  }

  emit(eventName: string, data?: unknown): void {
    this.getSocket().emit(eventName, data);
  }

  /**
   * Émet un événement et attend l'accusé de réception du serveur
   */
  emitWithAck<T>(eventName: string, data?: unknown): Promise<T> {
    return this.getSocket().emitWithAck(eventName, data) as Promise<T>;
  }

  /**
   * Écoute un événement du socket.
   * L'écoute n'ouvre pas la connexion, et reste valable si le socket est recréé ensuite.
   */
  listen<T>(eventName: string): Observable<T> {
    let subject = this.events.get(eventName);

    if (!subject) {
      const created = new Subject<unknown>();
      this.events.set(eventName, created);
      this.socket?.on(eventName, (data: unknown) => created.next(data));
      subject = created;
    }

    return subject.asObservable() as Observable<T>;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
