import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { ServerLayoutComponent } from './components/server-layout/server-layout.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const SERVER_ROUTES: Routes = [
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
