import { Component, OnInit } from '@angular/core';
import { InvitationService } from '../../../services/invitation/invitation.service';
import { Invitation, InvitationsResponse, ErrorResponse } from '../../../models/invitation.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  invitations: Invitation[] = [];
  serverId: string = '';

  constructor(
    private invitationService: InvitationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const rootRoute = this.route.pathFromRoot.find(route => route.snapshot.params['id']);
    if (rootRoute) {
      this.serverId = rootRoute.snapshot.params['id'];
      this.loadInvitations();
    }
  }

  /**
   * Charge la liste des invitations du serveur
   */
  loadInvitations(): void {
    this.invitationService.getInvitationsByServerId(this.serverId).subscribe({
      next: (response) => {
        if (this.isInvitationsResponse(response)) {
          this.invitations = response.data;
        }
      },
      error: (err) => {
        console.error('❌ Erreur HTTP:', err);
      }
    });
  }

  /**
   * Vérifie si la réponse est de type InvitationsResponse
   * @param response Réponse à vérifier
   * @returns true si la réponse est un InvitationsResponse, false sinon
   */
  isInvitationsResponse(response: InvitationsResponse | ErrorResponse): response is InvitationsResponse {
    return response.success === true;
  }
}
