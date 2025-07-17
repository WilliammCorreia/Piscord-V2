import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../../services/channel/channel.service';
import { CreateChannelResponse, ErrorResponse } from '../../../models/channel.model';

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
    private channelService: ChannelService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formGroup = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(32)
      ]]
    });
  }

  ngOnInit(): void {
    const rootRoute = this.route.pathFromRoot.find(route => route.snapshot.params['id']);
    if (rootRoute) {
      this.serverId = rootRoute.snapshot.params['id'];
    }
  }

  /**
   * Gère la soumission du formulaire de création de salon
   * Valide le formulaire, appelle le service pour créer le salon et gère les réponses
   * @param ev Événement de soumission du formulaire
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();

    if (this.formGroup.valid && this.serverId) {
      const body = {
        name: this.formGroup.value.name,
        serverId: this.serverId,
        roleIds: []
      };
      
      this.channelService.createChannel(body).subscribe({
        next: (res) => {
          if (this.isCreateChannelResponse(res)) {
            console.log('Salon créé avec succès:', res.data);
            this.router.navigate(['../list'], { relativeTo: this.route });
          } else {
            console.error('Erreur lors de la création:', res);
            alert('Erreur lors de la création du salon.');
          }
        },  
        error: (err) => {
          console.error("Erreur pour créer le salon: ", err);
          if (err.status === 400) {
            alert("Données invalides.");
          } else if (err.status === 403) {
            alert("Vous n'avez pas les permissions pour créer un salon.");
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
   * Vérifie si la réponse est de type CreateChannelResponse
   * @param res Réponse à vérifier
   * @returns true si la réponse est un CreateChannelResponse, false sinon
   */
  isCreateChannelResponse(res: CreateChannelResponse | ErrorResponse): res is CreateChannelResponse {
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
