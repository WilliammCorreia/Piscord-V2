import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DisconnectResponse } from '../models/home.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly url = "http://localhost:3000/api/auth";

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  disconnect(): Observable<DisconnectResponse> {
    return this.http.get<DisconnectResponse>(`${this.url}/disconnect`, {
      withCredentials: true
    });
  }
}
