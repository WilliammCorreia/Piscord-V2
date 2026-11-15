import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChannelsResponse, CreateChannelRequest, CreateChannelResponse } from '../../models/channel.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/channel`;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les salons d'un serveur
   * @param serverId ID du serveur
   * @returns Observable avec la liste des salons
   */
  getChannelsByServerId(serverId: string): Observable<ChannelsResponse> {
    return this.http.get<ChannelsResponse>(`${this.apiUrl}/server/${serverId}`);
  }

  /**
   * Crée un nouveau salon
   * @param channelData Données du salon à créer
   * @returns Observable avec le salon créé
   */
  createChannel(channelData: CreateChannelRequest): Observable<CreateChannelResponse> {
    return this.http.post<CreateChannelResponse>(`${this.apiUrl}/`, channelData);
  }
}
