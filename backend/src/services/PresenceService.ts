/**
 * Suivi des utilisateurs connectés, en mémoire.
 * Un utilisateur est « en ligne » tant qu'il a au moins un socket ouvert (plusieurs onglets
 * ou appareils comptent pour un seul statut).
 *
 * L'état vit dans ce processus : il suffit tant qu'il n'y a qu'une instance du backend.
 */
class PresenceService {
    private readonly connections = new Map<string, number>();

    /**
     * Enregistre l'ouverture d'un socket
     * @returns true si l'utilisateur vient de passer en ligne (c'était son premier socket)
     */
    connect(userId: string): boolean {
        const count = this.connections.get(userId) ?? 0;
        this.connections.set(userId, count + 1);
        return count === 0;
    }

    /**
     * Enregistre la fermeture d'un socket
     * @returns true si l'utilisateur vient de passer hors ligne (c'était son dernier socket)
     */
    disconnect(userId: string): boolean {
        const count = this.connections.get(userId) ?? 0;
        if (count <= 1) {
            this.connections.delete(userId);
            return count === 1;
        }
        this.connections.set(userId, count - 1);
        return false;
    }

    isOnline(userId: string): boolean {
        return this.connections.has(userId);
    }
}

export default new PresenceService();
