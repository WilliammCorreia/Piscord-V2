import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServerComponent } from './server.component';
import { ListComponent } from './components/list/list.component';
import { CreateComponent } from './components/create/create.component';
import { JoinComponent } from './components/join/join.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServerRoutingModule { }
