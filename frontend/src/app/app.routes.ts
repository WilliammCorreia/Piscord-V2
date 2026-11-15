import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "auth",
    pathMatch: "full"
  },
  {
    path: "auth",
    canActivate: [guestGuard],
    loadChildren: () => import("./features/auth/auth.routes").then(m => m.AUTH_ROUTES)
  },
  {
    path: "home",
    canActivate: [authGuard],
    loadChildren: () => import("./features/home/home.routes").then(m => m.HOME_ROUTES)
  },
  {
    path: "server",
    canActivate: [authGuard],
    loadChildren: () => import("./features/server/server.routes").then(m => m.SERVER_ROUTES)
  },
  {
    path: "settings",
    canActivate: [authGuard],
    loadChildren: () => import("./features/settings/settings.routes").then(m => m.SETTINGS_ROUTES)
  },
  {
    path: "**",
    redirectTo: ""
  }
];
