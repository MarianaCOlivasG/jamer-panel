import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchasesRoutingModule } from './purchases-routing.module';
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchaseFormComponent } from './pages/purchase-form/purchase-form.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { PurchaseDetailsComponent } from './pages/purchase-details/purchase-details.component';
import { PurchaseOrdersModalComponent } from './components/purchase-orders-modal/purchase-orders-modal.component';
import { PaymentsComponent } from './pages/payments/payments.component';



@NgModule({
  declarations: [
    PurchasesComponent,
    PurchaseFormComponent,
    PurchaseDetailsComponent,
    PurchaseOrdersModalComponent,
    PaymentsComponent
  ],
  imports: [
    CommonModule,
    PurchasesRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMultiSelectModule
  ]
})
export class PurchasesModule { }
