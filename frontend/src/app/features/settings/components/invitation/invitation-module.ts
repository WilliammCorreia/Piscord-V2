import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvitationRoutingModule } from './invitation-routing-module';
import { InvitationLayoutComponent } from './invitation-layout/invitation-layout.component';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    InvitationLayoutComponent,
    CreateComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InvitationRoutingModule
  ]
})
export class InvitationModule { }
