import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChannelLayoutComponent } from './channel-layout/channel-layout.component';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {
    path: '',
    component: ChannelLayoutComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'create', component: CreateComponent },
      { path: 'list', component: ListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChannelRoutingModule { }
