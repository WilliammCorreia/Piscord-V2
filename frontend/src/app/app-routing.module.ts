import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    redirectTo: "auth",
    pathMatch: "full"
  },
  {
    path: "auth",
    loadChildren: () => import("./features/auth/auth-module").then(m => m.AuthModule)
  },
  {
    path: "home",
    loadChildren: () => import("./features/home/home-module").then(m => m.HomeModule)
  },
  {
    path: "server",
    loadChildren: () => import("./features/server/server-module").then(m => m.ServerModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
