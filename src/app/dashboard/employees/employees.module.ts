import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesComponent } from './pages/employees/employees.component';
import { EmployeeDetailsComponent } from './pages/employee-details/employee-details.component';
import { EmployeesRoutingModule } from './employees-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmployeeModalComponent } from './components/employee-modal/employee-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordModalComponent } from './components/reset-password-modal/reset-password-modal.component';
import { EmployeeFormComponent } from './pages/employee-form/employee-form.component';
import { EmployeeEditComponent } from './pages/employee-edit/employee-edit.component';
import { CredentialsModalComponent } from './components/credentials-modal/credentials-modal.component';
import { IncidencesComponent } from './pages/incidences/incidences.component';
import { IncidenceFormModalComponent } from './components/incidence-form-modal/incidence-form-modal.component';
import { IncidenceConfirmComponent } from './components/incidence-confirm/incidence-confirm.component';
import { IncidenceDetailsModalComponent } from './components/incidence-details-modal/incidence-details-modal.component';
import { BonusesComponent } from './pages/bonuses/bonuses.component';
import { BonusFormModalComponent } from './components/bonus-form-modal/bonus-form-modal.component';
import { BonusDetailsModalComponent } from './components/bonus-details-modal/bonus-details-modal.component';
import { BonusConfirmComponent } from './components/bonus-confirm/bonus-confirm.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { EmployeeFilesModalComponent } from './components/employee-files-modal/employee-files-modal.component';
import { WorkstationComponent } from './pages/workstation/workstation.component';
import { WorkstationModalComponent } from './components/workstation-modal/workstation-modal.component';



@NgModule({
  declarations: [
    EmployeesComponent,
    EmployeeDetailsComponent,
    EmployeeModalComponent,
    ResetPasswordModalComponent,
    EmployeeFormComponent,
    EmployeeEditComponent,
    CredentialsModalComponent,
    IncidencesComponent,
    IncidenceFormModalComponent,
    IncidenceConfirmComponent,
    IncidenceDetailsModalComponent,
    BonusesComponent,
    BonusFormModalComponent,
    BonusDetailsModalComponent,
    BonusConfirmComponent,
    EmployeeFilesModalComponent,
    WorkstationComponent,
    WorkstationModalComponent
  ],
  imports: [
    CommonModule,
    EmployeesRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ZXingScannerModule
  ],
  exports: [
    IncidenceConfirmComponent,
    BonusConfirmComponent
  ]
  
})
export class EmployeesModule { }
