import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChannelsResponse, ErrorResponse } from '../../models/channel.model';
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

  getChannelByServer(serverId: string): Observable<ChannelsResponse | ErrorResponse> {
    return this.http.get<ChannelsResponse | ErrorResponse>(`${this.apiUrl}/server/${serverId}`, {
      withCredentials: true
    });
  }
}
