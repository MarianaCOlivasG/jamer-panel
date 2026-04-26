import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrdersRoutingModule } from './purchase-orders-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PurchaseOrdersComponent } from './pages/purchase-orders/purchase-orders.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchaseOrderDetailsComponent } from './pages/purchase-order-details/purchase-order-details.component';
import { PurchaseOrderFormComponent } from './pages/purchase-order-form/purchase-order-form.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';



@NgModule({
  declarations: [
    PurchaseOrdersComponent,
    PurchaseOrderDetailsComponent,
    PurchaseOrderFormComponent,
  ],
  imports: [
    CommonModule,
    PurchaseOrdersRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMultiSelectModule
  ]
})
export class PurchaseOrdersModule { }
