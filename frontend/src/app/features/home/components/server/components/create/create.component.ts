import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServerService } from '../../../../../server/services/server/server.service';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../../../../../../core/models/api.model';

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './create.component.scss',
    imports: [ReactiveFormsModule]
})
export class CreateComponent {
  public formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private serverService: ServerService,
    private router: Router
  ) {
    // Mêmes bornes que l'API (3 à 24 caractères)
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(24)]]
    });
  }

  /**
   * Gère la soumission du formulaire de création
   * Valide le formulaire, appelle le service de gestion de serveur et gère les réponses
   * @param ev Événement de soumission du formulaire
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();

    if (this.formGroup.valid) {
      const body = { name: this.formGroup.value.name };

      this.serverService.createServer(body).subscribe({
        next: (res) => {
          this.router.navigate(['/server', res.data.server._id]);
        },
        error: (err) => {
          console.error("Erreur la création du serveur: ", err);
          alert(apiErrorMessage(err));
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  /**
   * Vérifie si un champ du formulaire est invalide et a été touché
   * @param name Nom du champ à vérifier
   * @returns true si le champ est invalide et touché, false sinon
   */
  isFieldValid(name: string): boolean {
    const field = this.formGroup.get(name);
    return !!(field?.invalid && field?.touched);
  };
}
