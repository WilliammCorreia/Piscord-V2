import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from '../../services/auth.service';
import { SignupRequest } from '../../models/auth.model';

/**
 * Composant d'inscription utilisateur
 * Gère la création de compte utilisateur via un formulaire réactif avec validation
 */
@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, OnDestroy {

  public formGroup: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(64)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?!.*\s).{12,64}$/)]),
    pwdConfirm: new FormControl('', [Validators.required]),
    pseudo: new FormControl('', [Validators.required, Validators.pattern(/^[^\s]*$/), Validators.maxLength(24)])
  }, { validators: this.passwordMatchValidator });

  public isEmailAlreadyUsed: boolean = false;
  private subscription?: Subscription;

  /**
   * Constructeur du composant
   * @param authService Service d'authentification pour les appels API
   */
  constructor(private authService: AuthService) { }

  /**
   * Initialise le composant
   * Configure l'écoute des changements sur le champ email pour réinitialiser l'indicateur d'email existant
   */
  ngOnInit(): void {
    this.subscription = this.formGroup.get("email")?.valueChanges.subscribe(() => {
      this.isEmailAlreadyUsed = false;
    });
  }

  /**
   * Nettoie les ressources du composant
   * Désabonne les subscriptions pour éviter les fuites mémoire
   */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Validateur personnalisé pour vérifier la correspondance des mots de passe
   * @param control FormGroup contenant les champs password et pwdConfirm
   * @returns Erreur de validation si les mots de passe ne correspondent pas, null sinon
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const pwdConfirm = control.get('pwdConfirm');

    return password?.value === pwdConfirm?.value ? null : { passwordMismatch: true };
  }

  /**
   * Vérifie si un champ du formulaire est invalide et a été touché
   * @param name Nom du champ à vérifier
   * @returns true si le champ est invalide et touché, false sinon
   */
  isFieldValid(name: string): boolean {
    const field = this.formGroup.get(name);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Vérifie si les mots de passe ne correspondent pas
   * @returns true si les mots de passe ne correspondent pas et que le champ de confirmation a été touché
   */
  hasPasswordMismatch(): boolean {
    return !!(this.formGroup.errors?.['passwordMismatch'] && this.formGroup.get('pwdConfirm')?.touched);
  }

  /**
   * Gère la soumission du formulaire d'inscription
   * Valide le formulaire, appelle le service d'inscription et gère les réponses
   * @param ev Événement de soumission du formulaire
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();
    this.isEmailAlreadyUsed = false;

    if (this.formGroup.valid) {
      const credentials: SignupRequest = {
        email: this.formGroup.get("email")?.value,
        password: this.formGroup.get("password")?.value,
        username: this.formGroup.get("pseudo")?.value
      };

      this.authService.signup(credentials).subscribe({
        next: (res) => {
          console.log("Inscription réussie : ", res);
        },
        error: (err) => {
          if (err.error?.erreur === "Email déjà utilisé.") {
            this.isEmailAlreadyUsed = true;
          } else {
            console.error("Erreur lors de l'inscription:", err);
            alert("Une erreur est survenue, veuillez ressayer plus tard.");
          }
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
    }
  }
}
