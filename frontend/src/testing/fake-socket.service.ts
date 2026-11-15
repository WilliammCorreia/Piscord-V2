import { Observable, Subject } from 'rxjs';

/**
 * Remplace SocketService dans les tests : aucune connexion réseau n'est ouverte.
 * `emitted` permet de vérifier ce que le composant envoie, `trigger` de simuler
 * un événement reçu du serveur.
 */
export class FakeSocketService {
  readonly emitted: { event: string; data: unknown }[] = [];
  disconnected = false;

  private readonly subjects = new Map<string, Subject<unknown>>();

  private subject(event: string): Subject<unknown> {
    let subject = this.subjects.get(event);
    if (!subject) {
      subject = new Subject<unknown>();
      this.subjects.set(event, subject);
    }
    return subject;
  }

  emit(event: string, data: unknown): void {
    this.emitted.push({ event, data });
  }

  listen<T>(event: string): Observable<T> {
    return this.subject(event).asObservable() as Observable<T>;
  }

  disconnect(): void {
    this.disconnected = true;
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
