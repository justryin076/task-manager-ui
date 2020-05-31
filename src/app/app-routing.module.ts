import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserHomeComponent } from './user-home/user-home.component';


const routes: Routes = [{
  path: '',
  component: HomeComponent
},{
  path: 'home',
  component: UserHomeComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
