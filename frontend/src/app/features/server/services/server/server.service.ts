import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ErrorResponse, ServersResponse } from '../../models/server.model';
import { environment } from '../../../../../environments/environments.prod';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiUrl = `${environment.apiUrl}/server`;  

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
