import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageResponse, ErrorResponse, MessagesResponse } from '../../models/message.model';
import { environment } from '../../../../../environments/environments.prod';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly apiUrl = `${environment.apiUrl}/message`;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }
  
  /**
   * Envoie un nouveau message
   * @param body Objet contenant le contenu et la référence du message
   * @returns Observable de la réponse de création de message ou d'erreur
   */
  postMessage(body: Object): Observable<MessageResponse | ErrorResponse> {
    return this.http.post<MessageResponse | ErrorResponse>(`${this.apiUrl}/`, body, {
      withCredentials: true
    });
  }

  /**
   * Récupère les messages d'un channel spécifique
   * @param channelId ID du channel dont on veut récupérer les messages
   * @returns Observable de la réponse contenant la liste des messages ou d'erreur
   */
  getMessagesByChannel(channelId: string, page: number = 0): Observable<MessagesResponse | ErrorResponse> {
    return this.http.get<MessagesResponse | ErrorResponse>(`${this.apiUrl}/reference/${channelId}?page=${page}`, {
      withCredentials: true
    });
  }
}
