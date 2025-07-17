import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChannelRoutingModule } from './channel-routing-module';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { ChannelLayoutComponent } from './channel-layout/channel-layout.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ChannelLayoutComponent,
    CreateComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChannelRoutingModule
  ]
})
export class ChannelModule { }
