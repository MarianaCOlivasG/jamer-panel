import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent
  },
  // {
  //   path: 'my-incidences',
  //   component: UserIncidencesComponent
  // },
  // {
  //   path: 'my-bonuses',
  //   component: UserBonusesComponent
  // },
  {
      path: '**',
      redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
