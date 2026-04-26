import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadsComponent } from './pages/leads/leads.component';

const routes: Routes = [
  {
    path: '',
    component: LeadsComponent
  },
  {
      path: '**',
      redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadsRoutingModule { }
