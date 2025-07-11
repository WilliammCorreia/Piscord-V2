import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorResponse, SigninRequest, SigninResponse } from '../../models/auth.model';
import { Router } from '@angular/router';

/**
 * Composant de connexion utilisateur
 * Gère l'authentification des utilisateurs via un formulaire réactif
 */
@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {

  public formGroup: FormGroup;
  public isLoginFailed: boolean = false;

  /**
   * Constructeur du composant
   * @param fb Service Angular pour construire des formulaires réactifs
   * @param authService Service d'authentification pour les appels API
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  /**
   * Vérifie si la réponse est de type SigninResponse (succès) ou ErrorResponse (échec)
   * @param res Réponse à vérifier, peut être SigninResponse ou ErrorResponse
   * @returns true si la réponse est un SigninResponse (succès), false si c'est une ErrorResponse (échec)
   */
  isSigninResponse(res: SigninResponse | ErrorResponse): res is SigninResponse {
    return res.success === true;
  }

  /**
   * Gère la soumission du formulaire de connexion
   * Valide le formulaire, appelle le service d'authentification et gère les réponses
   * @param ev Événement de soumission du formulaire
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();
    this.isLoginFailed = false;

    if (this.formGroup.valid) {
      const credentials: SigninRequest = this.formGroup.value;

      this.authService.signin(credentials).subscribe({
        next: (res) => {
          if (this.isSigninResponse(res)) {
            this.authService.setUser(res.data);
            this.router.navigate(["/home"]);
          }
        },
        error: (err) => {
          if (err.error?.erreur === "Mot de passe incorrect." || err.error?.erreur === "Email introuvable." ) {
            this.isLoginFailed = true;
            this.formGroup.reset();
          } else {
            console.error('Erreur lors de la connexion:', err);
            alert("Une erreur est survenue, veuillez ressayer plus tard.");
          }
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
