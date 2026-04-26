import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashRegisterComponent } from './pages/cash-register/cash-register.component';
import { CashRegisterModalComponent } from './components/cash-register-modal/cash-register-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CashRegisterRoutingModule } from './cash-register-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CashRegisterValidModalComponent } from './components/cash-register-valid-modal/cash-register-valid-modal.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

// import { NgWhiteboardModule } from 'ng-whiteboard';


@NgModule({
  declarations: [
    CashRegisterComponent,
    CashRegisterModalComponent,
    CashRegisterValidModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    CashRegisterRoutingModule,
    AngularMultiSelectModule,
  ]
})
export class CashRegisterModule { }
