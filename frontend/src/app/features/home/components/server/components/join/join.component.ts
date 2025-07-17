import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from '../../services/server.service';
import { Router } from '@angular/router';
import { ErrorResponse, JoinServerResponse } from '../../models/server.model';

@Component({
  selector: 'app-join',
  standalone: false,
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss'
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
          if (this.isJoinServerResponse(res)) {
            const id = res.data?.server._id;
            console.log('Serveur rejoint avec succès:', res.data);
            this.router.navigate([`/server/${id}`]);
          } else {
            console.error('Erreur lors du rejoignement:', res);
            alert('Code de serveur invalide ou serveur introuvable.');
          }
        },  
        error: (err) => {
          console.error("Erreur pour rejoindre le serveur: ", err);
          if (err.status === 404) {
            alert("Code de serveur invalide.");
          } else if (err.status === 409) {
            alert("Vous êtes déjà membre de ce serveur.");
          } else {
            alert("Une erreur est survenue, veuillez ressayer plus tard.");
          }
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  isJoinServerResponse(res: JoinServerResponse | ErrorResponse): res is JoinServerResponse {
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
