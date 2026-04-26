import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './pages/sales/sales.component';
import { SaleFormComponent } from './pages/sale-form/sale-form.component';
import { SaleDetailsComponent } from './pages/sale-details/sale-details.component';

const routes: Routes = [
  {
    path: '',
    component: SalesComponent
  },
  {
    path: 'new',
    component: SaleFormComponent
  },
  {
    path: 'details/:id',
    component: SaleDetailsComponent
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
export class SalesRoutingModule { }
