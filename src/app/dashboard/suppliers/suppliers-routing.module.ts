import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { SupplierFormComponent } from './pages/supplier-form/supplier-form.component';
import { SupplierDetailsComponent } from './pages/supplier-details/supplier-details.component';
import { PaymentsComponent } from './pages/payments/payments.component';

const routes: Routes = [
  {
    path: '',
    component: SuppliersComponent
  },
  {
    path: 'details/:id',
    component: SupplierDetailsComponent
  },
  {
    path: 'new',
    component: SupplierFormComponent
  },
  {
    path: 'edit/:id',
    component: SupplierFormComponent
  },
  {
    path: 'payments',
    component: PaymentsComponent
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
export class SuppliersRoutingModule { }
