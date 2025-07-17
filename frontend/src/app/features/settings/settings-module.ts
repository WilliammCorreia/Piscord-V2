import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing-module';
import { SettingsLayoutComponent } from './components/settings-layout/settings-layout.component';
import { ChannelComponent } from './components/channel/channel.component';
import { InvitationComponent } from './components/invitation/invitation.component';


@NgModule({
  declarations: [
    SettingsLayoutComponent,
    ChannelComponent,
    InvitationComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
