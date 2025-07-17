import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateChannelRequest, CreateChannelResponse, ChannelsResponse, ErrorResponse } from '../../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private readonly url: string = "http://localhost:3000/api/channel";

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les salons d'un serveur
   * @param serverId ID du serveur
   * @returns Observable avec la liste des salons
   */
  getChannelsByServerId(serverId: string): Observable<ChannelsResponse | ErrorResponse> {
    return this.http.get<ChannelsResponse | ErrorResponse>(`${this.url}/server/${serverId}`, {
      withCredentials: true
    });
  }

  /**
   * Crée un nouveau salon
   * @param channelData Données du salon à créer
   * @returns Observable avec le salon créé
   */
  createChannel(channelData: CreateChannelRequest): Observable<CreateChannelResponse | ErrorResponse> {
    return this.http.post<CreateChannelResponse | ErrorResponse>(`${this.url}/`, channelData, {
      withCredentials: true
    });
  }
}
