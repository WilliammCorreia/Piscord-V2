import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {

  public formGroup: FormGroup;
  public isLoginFailed: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(ev: Event) {
    ev.preventDefault();
    this.isLoginFailed = false;

    if (this.formGroup.valid) {
      const credentials = this.formGroup.value;

      this.authService.signin(credentials).subscribe({
        next: (res) => {
          console.log("Connexion réussie : ", res);
        },
        error: (err) => {
          this.isLoginFailed = true;
          this.formGroup.reset();
        }
      });
    }
  };

  isFieldValid(name: string) {
    const field = this.formGroup.get(name);
    return field?.invalid && field?.touched
  };
}
