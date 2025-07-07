import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ErrorResponse, ServersResponse } from '../models/server';

@Injectable({
  providedIn: 'root'
})
export class Server {
  private readonly url = "http://localhost:3000/api/server";

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  getUserServers(): Observable<ServersResponse | ErrorResponse> {
    return this.http.get<ServersResponse | ErrorResponse>(`${this.url}/user`, {
      withCredentials: true
    });
  }
}
