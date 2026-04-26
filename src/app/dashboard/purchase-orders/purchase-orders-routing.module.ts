import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseOrdersComponent } from './pages/purchase-orders/purchase-orders.component';
import { PurchaseOrderDetailsComponent } from './pages/purchase-order-details/purchase-order-details.component';
import { PurchaseOrderFormComponent } from './pages/purchase-order-form/purchase-order-form.component';

const routes: Routes = [
  {
    path: '',
    component: PurchaseOrdersComponent
  },
  {
    path: 'details/:id',
    component: PurchaseOrderDetailsComponent
  },
  {
    path: 'new',
    component: PurchaseOrderFormComponent
  },
  {
    path: 'edit/:id',
    component: PurchaseOrderFormComponent
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
export class PurchaseOrdersRoutingModule { }
