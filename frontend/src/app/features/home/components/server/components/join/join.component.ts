import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServerService } from '../../../../../server/services/server/server.service';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../../../../../../core/models/api.model';

@Component({
    selector: 'app-join',
    templateUrl: './join.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
})
export class JoinComponent {
  public formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private serverService: ServerService,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Gère la soumission du formulaire de rejoignement
   * Valide le formulaire, appelle le service pour rejoindre le serveur et gère les réponses
   * @param ev Événement de soumission du formulaire
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();

    if (this.formGroup.valid) {
      const body = { code: this.formGroup.value.code };

      this.serverService.joinServer(body).subscribe({
        next: (res) => {
          this.router.navigate(['/server', res.data.server._id]);
        },
        error: (err) => {
          console.error("Erreur pour rejoindre le serveur: ", err);
          if (err.status === 404) {
            alert("Code de serveur invalide.");
          } else {
            // 409 déjà membre, 400 invitation expirée ou épuisée, 429 trop de tentatives :
            // l'API fournit un message adapté à chaque cas
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
