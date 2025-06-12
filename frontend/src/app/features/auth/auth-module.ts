import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { SignupComponent } from './components/signup/signup.component';
import { SigninComponent } from './components/signin/signin.component';


@NgModule({
  declarations: [
    AuthLayoutComponent,
    SignupComponent,
    SigninComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
