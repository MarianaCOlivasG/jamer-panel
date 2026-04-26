import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { SupplierFormComponent } from './pages/supplier-form/supplier-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupplierDetailsComponent } from './pages/supplier-details/supplier-details.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ContactModalComponent } from './components/contact-modal/contact-modal.component';


@NgModule({
  declarations: [
    SuppliersComponent,
    SupplierFormComponent,
    SupplierDetailsComponent,
    PaymentsComponent,
    PaymentModalComponent,
    ContactModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SuppliersRoutingModule,
    AngularMultiSelectModule
  ]
})
export class SuppliersModule { }
