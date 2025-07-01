import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../services/server.service';
import { Router } from '@angular/router';
import { CreateServerResponse, ErrorResponse } from '../../models/server.model';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  public formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private serverService: ServerService,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(32)]]
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
          if (this.isCreateServerResponse(res)) {
            const id = res.data?.server._id;
            // this.router.navigate(["server/", id]);
          }
        },
        error: (err) => {
          console.error("Erreur la création du serveur: ", err);
          alert("Une erreur est survenue, veuillez ressayer plus tard.");
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  isCreateServerResponse(res: CreateServerResponse | ErrorResponse): res is CreateServerResponse {
    return res.success === true;
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
