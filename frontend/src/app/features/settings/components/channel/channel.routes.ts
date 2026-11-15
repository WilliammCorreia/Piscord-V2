import { Routes } from '@angular/router';
import { ChannelLayoutComponent } from './channel-layout/channel-layout.component';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';

export const CHANNEL_ROUTES: Routes = [
  {
    path: "",
    component: ChannelLayoutComponent,
    children: [
      { path: "", redirectTo: "list", pathMatch: "full" },
      { path: "create", component: CreateComponent },
      { path: "list", component: ListComponent }
    ]
  }
];
