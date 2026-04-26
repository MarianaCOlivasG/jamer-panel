import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { PurchaseDetailsComponent } from './pages/purchase-details/purchase-details.component';
import { PurchaseFormComponent } from './pages/purchase-form/purchase-form.component';
import { PaymentsComponent } from './pages/payments/payments.component';

const routes: Routes = [
  {
    path: '',
    component: PurchasesComponent
  },
  {
    path: 'payments',
    component: PaymentsComponent
  },
  {
    path: 'details/:id',
    component: PurchaseDetailsComponent
  },
  {
    path: 'new',
    component: PurchaseFormComponent
  },
  {
    path: 'edit/:id',
    component: PurchaseFormComponent
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
export class PurchasesRoutingModule { }
