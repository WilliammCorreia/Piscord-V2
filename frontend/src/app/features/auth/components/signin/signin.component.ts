import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SigninRequest } from '../../models/auth.model';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../../../../core/models/api.model';

/**
 * Composant de connexion utilisateur
 * Gère l'authentification des utilisateurs via un formulaire réactif
 */
@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule]
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
          this.authService.setUser(res.data);
          this.router.navigate(["/home"]);
        },
        error: (err) => {
          // 401 : identifiants incorrects (l'API ne précise pas lequel, volontairement)
          if (err.status === 401) {
            this.isLoginFailed = true;
            this.formGroup.reset();
          } else {
            console.error('Erreur lors de la connexion:', err);
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
   * @param name Nom du champ à vérifier
   * @returns true si le champ est invalide et touché, false sinon
   */
  isFieldValid(name: string): boolean {
    const field = this.formGroup.get(name);
    return !!(field?.invalid && field?.touched);
  };
}
