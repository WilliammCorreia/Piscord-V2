import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerLayoutComponent } from './components/server-layout/server-layout.component';
import { ChatComponent } from './components/chat/chat.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ServerRoutingModule } from '../home/components/server/server-routing-module';



@NgModule({
  declarations: [
    ServerLayoutComponent,
    ChatComponent,
    WelcomeComponent
  ],
  imports: [
    CommonModule,
    ServerRoutingModule
  ]
})
export class ServerModule { }
