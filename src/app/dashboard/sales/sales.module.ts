import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesComponent } from './pages/sales/sales.component';
import { SalesRoutingModule } from './sales-routing.module';
import { SaleFormComponent } from './pages/sale-form/sale-form.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { SaleDetailsComponent } from './pages/sale-details/sale-details.component';

@NgModule({
  declarations: [
    SalesComponent,
    SaleFormComponent,
    SaleDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SalesRoutingModule,
    AngularMultiSelectModule
  ]
})
export class SalesModule { }
