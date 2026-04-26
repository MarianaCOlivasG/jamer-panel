import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './pages/employees/employees.component';
import { EmployeeDetailsComponent } from './pages/employee-details/employee-details.component';
import { EmployeeFormComponent } from './pages/employee-form/employee-form.component';
import { EmployeeEditComponent } from './pages/employee-edit/employee-edit.component';
import { IncidencesComponent } from './pages/incidences/incidences.component';
import { BonusesComponent } from './pages/bonuses/bonuses.component';
import { WorkstationComponent } from './pages/workstation/workstation.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeesComponent
  },
  {
    path: 'details/:id',
    component: EmployeeDetailsComponent
  },
  {
    path: 'new',
    component: EmployeeFormComponent
  },
  {
    path: 'edit/:id',
    component: EmployeeEditComponent
  },
  {
    path: 'incidences',
    component: IncidencesComponent
  },
  {
    path: 'bonuses',
    component: BonusesComponent
  },
  {
    path: 'workstation',
    component: WorkstationComponent
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
export class EmployeesRoutingModule { }
