import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './components/home-layout/home-layout.component';
import { ProfileComponent } from './components/profile/profile.component';

export const HOME_ROUTES: Routes = [
  {
    path: "",
    component: HomeLayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "profile",
        pathMatch: "full"
      },
      {
        path: "profile",
        component: ProfileComponent
      },
      {
        path: "friends",
        loadComponent: () => import("../friends/components/friends/friends.component").then(m => m.FriendsComponent)
      },
      {
        // Conversation privée avec un ami : le même composant de chat que pour un salon
        path: "friends/:conversationId",
        loadComponent: () => import("../server/components/chat/chat.component").then(m => m.ChatComponent)
      },
      {
        path: "server",
        loadChildren: () => import("./components/server/server.routes").then(m => m.HOME_SERVER_ROUTES)
      }
    ]
  }
];
