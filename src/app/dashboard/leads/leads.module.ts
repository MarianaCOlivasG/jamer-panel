import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadsRoutingModule } from './leads-routing.module';
import { LeadsComponent } from './pages/leads/leads.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LeadModalComponent } from './components/lead-modal/lead-modal.component';



@NgModule({
  declarations: [
    LeadsComponent,
    LeadModalComponent
  ],
  imports: [
    CommonModule,
    LeadsRoutingModule,
    SharedModule
  ]
})
export class LeadsModule { }
