import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServerLayoutComponent } from './components/server-layout/server-layout.component';
import { ChatComponent } from './components/chat/chat.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

const routes: Routes = [
  {
    path: ":id",
    component: ServerLayoutComponent,
    children: [
      { path: "", redirectTo: "welcome", pathMatch: "full" },
      { path: "welcome", component: WelcomeComponent },
      { path: "channel/:channelId", component: ChatComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServerRoutingModule { }
