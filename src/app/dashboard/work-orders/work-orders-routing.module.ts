import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrdersComponent } from './pages/work-orders/work-orders.component';
import { WorkOrderFormComponent } from './pages/work-order-form/work-order-form.component';
import { WorkOrderDetailsComponent } from './pages/work-order-details/work-order-details.component';
import { WorkOrderSolutionFormComponent } from './pages/work-order-solution-form/work-order-solution-form.component';
import { PlanningComponent } from './pages/planning/planning.component';
import { PlanningTestComponent } from './pages/planning-test/planning-test.component';
import { WorkOrderFormEditComponent } from './pages/work-order-form-edit/work-order-form-edit.component';
import { WorkorderreprogramComponent } from './pages/reprogram/work-order-reprogram.component';
import { FormEvidenciasComponent } from './pages/FormEvidencias/FormEvidencias.component';

const routes: Routes = [
  {
    path: 'list/:statusId',
    component: WorkOrdersComponent
  },
  {
    path: 'details/:id',
    component: WorkOrderDetailsComponent
  },
  {
    path: 'reprogram/:id',
    component: WorkorderreprogramComponent
  },
  {
    path: 'new',
    component: WorkOrderFormComponent
  },
  {
   path: 'new/:contractId/:typeWork/:budgetId',
    component: WorkOrderFormComponent

  },
 
  {
    path: 'edit/:id',
    component: WorkOrderFormEditComponent
  },
  {
    path: 'edit-solution/:id',
    component: WorkOrderSolutionFormComponent
  },
  {
    path: 'formEv/:id',
    component: FormEvidenciasComponent
  },
  {
    path: 'planning',
    component: PlanningComponent
  },
  {
    path: 'planning-test',
    component: PlanningTestComponent
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
export class WorkOrdersRoutingModule { }
