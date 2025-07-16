import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly url: string = "http://localhost:3000";

  constructor() { 
    this.socket = io(this.url);
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
