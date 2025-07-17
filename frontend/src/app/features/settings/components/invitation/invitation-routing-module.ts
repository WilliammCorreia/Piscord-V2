import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvitationLayoutComponent } from './invitation-layout/invitation-layout.component';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvitationRoutingModule { }
