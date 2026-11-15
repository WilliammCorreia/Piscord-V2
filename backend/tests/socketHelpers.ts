import { type Server as HttpServer, createServer as createHttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { type Socket, io as connect } from 'socket.io-client';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import { initSocket } from '../src/socket/index.ts';
import { app } from './helpers.ts';

/**
 * Démarre l'application avec Socket.io sur un port libre pour la durée du fichier de test,
 * et ferme après chaque test les sockets ouverts avec `open`.
 */
export function useSocketServer() {
    let httpServer: HttpServer;
    let url = '';
    const sockets: Socket[] = [];

    beforeAll(async () => {
        httpServer = createHttpServer(app);
        initSocket(httpServer);
        await new Promise<void>((resolve) => httpServer.listen(0, resolve));
        url = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
    });

    afterEach(() => {
        for (const socket of sockets.splice(0)) socket.disconnect();
    });

    afterAll(async () => {
        await new Promise((resolve) => httpServer.close(resolve));
    });

    return {
        /** Ouvre un socket avec les cookies donnés ; rejette si le serveur refuse la connexion */
        open(cookie?: string): Promise<Socket> {
            return new Promise((resolve, reject) => {
                const socket = connect(url, {
                    transports: ['websocket'],
                    reconnection: false,
                    extraHeaders: cookie ? { cookie } : undefined,
                });
                sockets.push(socket);
                socket.once('connect', () => resolve(socket));
                socket.once('connect_error', reject);
            });
        },
    };
}

export function nextEvent<T>(socket: Socket, event: string): Promise<T> {
    return new Promise((resolve) => socket.once(event, resolve));
}

/** Attend le prochain événement qui vérifie une condition (les autres sont ignorés) */
export function nextEventMatching<T>(socket: Socket, event: string, predicate: (payload: T) => boolean): Promise<T> {
    return new Promise((resolve) => {
        const handler = (payload: T) => {
            if (predicate(payload)) {
                socket.off(event, handler);
                resolve(payload);
            }
        };
        socket.on(event, handler);
    });
}

/** Vérifie qu'aucun événement (vérifiant la condition, si elle est donnée) n'arrive pendant un court délai */
export async function expectNoEvent<T = unknown>(
    socket: Socket,
    event: string,
    predicate: (payload: T) => boolean = () => true
): Promise<void> {
    const received: T[] = [];
    const handler = (payload: T) => { if (predicate(payload)) received.push(payload); };

    socket.on(event, handler);
    await new Promise((resolve) => setTimeout(resolve, 300));
    socket.off(event, handler);

    expect(received).toEqual([]);
}

/** Laisse au serveur le temps de traiter les événements déjà envoyés */
export function settle(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
