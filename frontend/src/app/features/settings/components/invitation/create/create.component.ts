import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../../services/invitation/invitation.service';
import { CreateInvitationResponse, ErrorResponse } from '../../../models/invitation.model';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  public formGroup: FormGroup;
  private serverId: string = '';

  constructor(
    private fb: FormBuilder,
    private invitationService: InvitationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formGroup = this.fb.group({
      time: ['', [Validators.required, Validators.min(1)]],
      maxUsage: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Récupérer l'ID du serveur depuis les paramètres de route
    const rootRoute = this.route.pathFromRoot.find(route => route.snapshot.params['id']);
    if (rootRoute) {
      this.serverId = rootRoute.snapshot.params['id'];
    }
  }

  /**
   * Gère la soumission du formulaire de création d'invitation
   * Valide le formulaire, appelle le service pour créer l'invitation et gère les réponses
   * @param ev Événement de soumission du formulaire
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();

    if (this.formGroup.valid && this.serverId) {
      // Calculer la date d'expiration
      const timeInDays = this.formGroup.value.time;
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + timeInDays);

      const body = {
        serverId: this.serverId,
        expiredAt: expiredAt.toISOString(),
        maxUsage: this.formGroup.value.maxUsage
      };
      
      this.invitationService.createInvitation(body).subscribe({
        next: (res) => {
          if (this.isCreateInvitationResponse(res)) {
            console.log('Invitation créée avec succès:', res.data);
            // Rediriger vers la liste des invitations
            this.router.navigate(['../list'], { relativeTo: this.route });
          } else {
            console.error('Erreur lors de la création:', res);
            alert('Erreur lors de la création de l\'invitation.');
          }
        },  
        error: (err) => {
          console.error("Erreur pour créer l'invitation: ", err);
          if (err.status === 400) {
            alert("Données invalides.");
          } else if (err.status === 403) {
            alert("Vous n'avez pas les permissions pour créer une invitation.");
          } else {
            alert("Une erreur est survenue, veuillez ressayer plus tard.");
          }
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  /**
   * Vérifie si la réponse est de type CreateInvitationResponse
   * @param res Réponse à vérifier
   * @returns true si la réponse est un CreateInvitationResponse, false sinon
   */
  isCreateInvitationResponse(res: CreateInvitationResponse | ErrorResponse): res is CreateInvitationResponse {
    return res.success === true;
  }

  /**
   * Vérifie si un champ du formulaire est invalide et a été touché
   * @param fieldName Nom du champ à vérifier
   * @returns true si le champ est invalide et touché, false sinon
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
