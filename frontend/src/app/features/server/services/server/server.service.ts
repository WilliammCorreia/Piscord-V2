import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ErrorResponse, ServersResponse } from '../../models/server.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/server`;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  getServerByUser(): Observable<ServersResponse | ErrorResponse> {
    return this.http.get<ServersResponse | ErrorResponse>(`${this.apiUrl}/user`, {
      withCredentials: true
    });
  }
}
