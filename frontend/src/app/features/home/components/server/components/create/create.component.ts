import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create',
  standalone: false,
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  public formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(32)]]
    });
  }

  /**
   * Gère la soumission du formulaire de connexion
   * Valide le formulaire, appelle le service d'authentification et gère les réponses
   * @param ev Événement de soumission du formulaire
   */
  onSubmit(ev: Event): void {
    ev.preventDefault();

    if (this.formGroup.valid) {

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
