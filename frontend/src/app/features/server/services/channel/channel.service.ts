import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChannelsResponse, ErrorResponse } from '../../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private readonly url = "http://localhost:3000/api/channel";

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  getChannelByServer(serverId: string): Observable<ChannelsResponse | ErrorResponse> {
    return this.http.get<ChannelsResponse | ErrorResponse>(`${this.url}/server/${serverId}`, {
      withCredentials: true
    });
  }
}
