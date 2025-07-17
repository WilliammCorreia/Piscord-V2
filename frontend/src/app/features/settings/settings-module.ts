import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing-module';
import { SettingsLayoutComponent } from './components/settings-layout/settings-layout.component';


@NgModule({
  declarations: [
    SettingsLayoutComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule
  ]
})
export class SettingsModule { }
