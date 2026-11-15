import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateServerRequest,
  CreateServerResponse,
  JoinServerRequest,
  JoinServerResponse,
  ServerResponse,
  ServersResponse
} from '../../models/server.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/server`;
  private readonly invitationUrl = `${environment.BACKEND_ADDRESS}/api/invitation`;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  /**
   * Récupère les serveurs dont l'utilisateur connecté est membre
   */
  getServerByUser(): Observable<ServersResponse> {
    return this.http.get<ServersResponse>(`${this.apiUrl}/user`);
  }

  /**
   * Récupère un serveur et la liste de ses membres
   * @param serverId ID du serveur
   */
  getServerById(serverId: string): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(`${this.apiUrl}/${serverId}`);
  }

  /**
   * Crée un nouveau serveur
   * @param body Nom du serveur
   */
  createServer(body: CreateServerRequest): Observable<CreateServerResponse> {
    return this.http.post<CreateServerResponse>(`${this.apiUrl}/`, body);
  }

  /**
   * Rejoint un serveur avec un code d'invitation
   * @param joinData Code d'invitation
   */
  joinServer(joinData: JoinServerRequest): Observable<JoinServerResponse> {
    return this.http.post<JoinServerResponse>(`${this.invitationUrl}/join`, joinData);
  }
}
