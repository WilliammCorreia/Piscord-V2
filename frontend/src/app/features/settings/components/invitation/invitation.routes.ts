import { Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { InvitationLayoutComponent } from './invitation-layout/invitation-layout.component';
import { ListComponent } from './list/list.component';

export const INVITATION_ROUTES: Routes = [
  {
    path: "",
    component: InvitationLayoutComponent,
    children: [
      { path: "", redirectTo: "list", pathMatch: "full" },
      { path: "create", component: CreateComponent },
      { path: "list", component: ListComponent }
    ]
  }
];
