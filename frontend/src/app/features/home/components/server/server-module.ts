import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServerRoutingModule } from './server-routing-module';
import { ListComponent } from './components/list/list.component';
import { CreateComponent } from './components/create/create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { JoinComponent } from './components/join/join.component';


@NgModule({
  declarations: [
    ListComponent,
    CreateComponent,
    JoinComponent
  ],
  imports: [
    CommonModule,
    ServerRoutingModule,
    ReactiveFormsModule
  ]
})
export class ServerModule { }
