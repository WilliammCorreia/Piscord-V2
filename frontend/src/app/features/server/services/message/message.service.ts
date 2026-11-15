import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMessageRequest, MessageResponse, MessagesResponse } from '../../models/message.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/message`;

  /**
   * Constructeur du service
   * @param http Client HTTP Angular pour les requêtes API
   */
  constructor(private http: HttpClient) { }

  /**
   * Envoie un nouveau message
   * @param body Objet contenant le contenu et la référence du message
   * @returns Observable de la réponse de création de message
   */
  postMessage(body: CreateMessageRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/`, body);
  }

  /**
   * Récupère une page de messages d'un channel, par ordre chronologique
   * @param channelId ID du channel dont on veut récupérer les messages
   * @param before Curseur : ID du plus ancien message déjà chargé (absent = messages les plus récents)
   * @returns Observable de la réponse contenant la liste des messages
   */
  getMessagesByChannel(channelId: string, before?: string): Observable<MessagesResponse> {
    const params = before ? new HttpParams().set('before', before) : undefined;

    return this.http.get<MessagesResponse>(`${this.apiUrl}/reference/${channelId}`, { params });
  }
}
