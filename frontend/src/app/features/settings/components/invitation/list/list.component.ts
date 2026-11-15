import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { InvitationService } from '../../../services/invitation/invitation.service';
import { Invitation } from '../../../models/invitation.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
        this.invitations = response.data;
      },
      error: (err) => {
        console.error('Erreur HTTP:', err);
      }
    });
  }
}
