import { Observable, Subject } from 'rxjs';

/**
 * Remplace SocketService dans les tests : aucune connexion réseau n'est ouverte.
 * `emitted` permet de vérifier ce que le composant envoie, `trigger` de simuler
 * un événement reçu du serveur.
 */
export class FakeSocketService {
  readonly emitted: { event: string; data: unknown }[] = [];
  connected = false;
  disconnected = false;
  id = 'socket-test';

  /** Réponses données aux `emitWithAck`, par nom d'événement */
  readonly ackResponses = new Map<string, unknown>();

  private readonly subjects = new Map<string, Subject<unknown>>();

  private subject(event: string): Subject<unknown> {
    let subject = this.subjects.get(event);
    if (!subject) {
      subject = new Subject<unknown>();
      this.subjects.set(event, subject);
    }
    return subject;
  }

  connect(): void {
    this.connected = true;
  }

  emit(event: string, data?: unknown): void {
    this.emitted.push({ event, data });
  }

  emitWithAck<T>(event: string, data?: unknown): Promise<T> {
    this.emitted.push({ event, data });
    return Promise.resolve(this.ackResponses.get(event) as T);
  }

  listen<T>(event: string): Observable<T> {
    return this.subject(event).asObservable() as Observable<T>;
  }

  disconnect(): void {
    this.connected = false;
    this.disconnected = true;
    this.trigger('disconnect');
  }

  /** Simule un événement envoyé par le serveur */
  trigger(event: string, data?: unknown): void {
    this.subject(event).next(data);
  }

  /** Événements émis par le composant pour un nom donné */
  emittedFor(event: string): unknown[] {
    return this.emitted.filter((entry) => entry.event === event).map((entry) => entry.data);
  }
}
