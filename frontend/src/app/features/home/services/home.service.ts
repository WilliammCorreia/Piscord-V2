import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DisconnectResponse } from '../models/home.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/auth`;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  disconnect(): Observable<DisconnectResponse> {
    return this.http.get<DisconnectResponse>(`${this.apiUrl}/disconnect`, {
      withCredentials: true
    });
  }
}
