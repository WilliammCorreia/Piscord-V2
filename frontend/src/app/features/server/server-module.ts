import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerLayoutComponent } from './components/server-layout/server-layout.component';
import { ChatComponent } from './components/chat/chat.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ServerRoutingModule } from './server-routing-module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ServerLayoutComponent,
    ChatComponent,
    WelcomeComponent
  ],
  imports: [
    CommonModule,
    ServerRoutingModule,
    FormsModule
  ]
})
export class ServerModule { }
