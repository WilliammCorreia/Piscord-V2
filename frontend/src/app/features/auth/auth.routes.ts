import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';

export const AUTH_ROUTES: Routes = [
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      { path: "", redirectTo: "signin", pathMatch: "full" },
      { path: "signin", component: SigninComponent },
      { path: "signup", component: SignupComponent }
    ]
  }
];
