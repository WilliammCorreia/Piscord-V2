import { Routes } from '@angular/router';
import { SettingsLayoutComponent } from './components/settings-layout/settings-layout.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: ":id",
    component: SettingsLayoutComponent,
    children: [
      { path: "", redirectTo: "channel", pathMatch: "full" },
      { path: "invitation", loadChildren: () => import("./components/invitation/invitation.routes").then(m => m.INVITATION_ROUTES) },
      { path: "channel", loadChildren: () => import("./components/channel/channel.routes").then(m => m.CHANNEL_ROUTES) }
    ]
  }
];
