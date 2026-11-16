import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../../../server/services/channel/channel.service';
import { apiErrorMessage } from '../../../../../core/models/api.model';

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
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
    // Mêmes bornes que l'API (3 à 24 caractères)
    this.formGroup = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(24)
      ]],
      type: ['text', [Validators.required]]
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
        type: this.formGroup.value.type,
        roleIds: []
      };

      this.channelService.createChannel(body).subscribe({
        next: () => {
          this.router.navigate(['../list'], { relativeTo: this.route });
        },
        error: (err) => {
          console.error("Erreur pour créer le salon: ", err);
          if (err.status === 403) {
            alert("Vous n'avez pas les permissions pour créer un salon.");
          } else {
            alert(apiErrorMessage(err));
          }
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
    }
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
