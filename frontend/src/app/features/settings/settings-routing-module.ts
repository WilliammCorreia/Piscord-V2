import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsLayoutComponent } from './components/settings-layout/settings-layout.component';

const routes: Routes = [
  {
    path: ":id",
    component: SettingsLayoutComponent,
    children: [
      { path: "", redirectTo: "channel", pathMatch: "full" },
      { path: "invitation", loadChildren: () => import("./components/invitation/invitation-module").then(m => m.InvitationModule) },
      { path: "channel", loadChildren: () => import("./components/channel/channel-module").then(m => m.ChannelModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
