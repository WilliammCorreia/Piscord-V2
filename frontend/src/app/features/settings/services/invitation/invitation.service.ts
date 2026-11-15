import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInvitationRequest, CreateInvitationResponse, InvitationsResponse } from '../../models/invitation.model';
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
  getInvitationsByServerId(serverId: string): Observable<InvitationsResponse> {
    return this.http.get<InvitationsResponse>(`${this.apiUrl}/server/${serverId}`);
  }

  /**
   * Crée une nouvelle invitation
   * @param invitationData Données de l'invitation à créer
   * @returns Observable avec l'invitation créée
   */
  createInvitation(invitationData: CreateInvitationRequest): Observable<CreateInvitationResponse> {
    return this.http.post<CreateInvitationResponse>(`${this.apiUrl}/`, invitationData);
  }
}
