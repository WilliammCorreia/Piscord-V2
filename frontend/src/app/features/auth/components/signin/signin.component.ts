import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {

  public formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(ev: Event) {
    ev.preventDefault();
    console.log("value : ", this.formGroup.value);
  };

  isFieldValid(name: string) {
    const field = this.formGroup.get(name);
    return field?.invalid && field?.touched
  }
}
