import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  public formGroup: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    pwdConfirm: new FormControl('', [Validators.required]),
    pseudo: new FormControl('', [Validators.required])
  });

  constructor() { }

  async onSubmit(event: Event) {

  };

  isFieldValid(name: string) {
    const field = this.formGroup.get(name);
    return field?.invalid && field?.touched;
  };
}
