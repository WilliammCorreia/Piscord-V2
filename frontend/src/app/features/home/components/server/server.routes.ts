import { Routes } from '@angular/router';
import { CreateComponent } from './components/create/create.component';
import { JoinComponent } from './components/join/join.component';
import { ListComponent } from './components/list/list.component';
import { ServerComponent } from './server.component';

export const HOME_SERVER_ROUTES: Routes = [
  {
    path: "",
    component: ServerComponent,
    children: [
      { path: "", redirectTo: "list", pathMatch: "full" },
      { path: "list", component: ListComponent },
      { path: "create", component: CreateComponent },
      { path: "join", component: JoinComponent }
    ]
  }
];
