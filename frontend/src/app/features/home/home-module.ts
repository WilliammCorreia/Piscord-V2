import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeLayoutComponent } from './components/home-layout/home-layout.component';
import { HomeRoutingModule } from './home-routing-module';
import { ServerComponent } from './components/server/server.component';
import { ProfileComponent } from './components/profile/profile.component';



@NgModule({
  declarations: [
    HomeLayoutComponent,
    ServerComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
