import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}`;

  constructor() { 
    this.socket = io(this.apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable((subscribe) => {
      this.socket.on(eventName, (data: T) => {
        subscribe.next(data);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
