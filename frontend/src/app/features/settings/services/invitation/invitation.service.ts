import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInvitationRequest, CreateInvitationResponse, InvitationsResponse, ErrorResponse } from '../../models/invitation.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private readonly apiUrl = `${environment.BACKEND_ADDRESS}/api/invitation`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les invitations d'un serveur
   * @param serverId ID du serveur
   * @returns Observable avec la liste des invitations
   */
  getInvitationsByServerId(serverId: string): Observable<InvitationsResponse | ErrorResponse> {
    return this.http.get<InvitationsResponse | ErrorResponse>(`${this.apiUrl}/server/${serverId}`, {
      withCredentials: true
    });
  }

  /**
   * Crée une nouvelle invitation
   * @param invitationData Données de l'invitation à créer
   * @returns Observable avec l'invitation créée
   */
  createInvitation(invitationData: CreateInvitationRequest): Observable<CreateInvitationResponse | ErrorResponse> {
    return this.http.post<CreateInvitationResponse | ErrorResponse>(`${this.apiUrl}/`, invitationData, {
      withCredentials: true
    });
  }
}
