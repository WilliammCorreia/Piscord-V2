import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsLayoutComponent } from './components/settings-layout/settings-layout.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { ChannelComponent } from './components/channel/channel.component';

const routes: Routes = [
  {
    path: ":id",
    component: SettingsLayoutComponent,
    children: [
      { path: "", redirectTo: "channel", pathMatch: "full" },
      { path: "invitation", component: InvitationComponent },
      { path: "channel", component: ChannelComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
