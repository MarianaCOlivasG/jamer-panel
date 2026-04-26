import { NgModule, CUSTOM_ELEMENTS_SCHEMA,  } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkOrdersRoutingModule } from './work-orders-routing.module';
import { WorkOrdersComponent } from './pages/work-orders/work-orders.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkOrderFormComponent } from './pages/work-order-form/work-order-form.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { WorkOrderDetailsComponent } from './pages/work-order-details/work-order-details.component';
import { AssignToModalComponent } from './pages/assign-to-modal/assign-to-modal.component';
import { WorkSolutionComponent } from './pages/work-solution/work-solution.component';
import { StarRatingModule } from 'angular-star-rating';
import { CancelModalComponent } from './components/cancel-modal/cancel-modal.component';
import { LightgalleryModule } from 'lightgallery/angular';
import { WorkOrderSolutionFormComponent } from './pages/work-order-solution-form/work-order-solution-form.component';
import { PlanningComponent } from './pages/planning/planning.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomersModule } from '../customers/customers.module';
import { PlanningTestComponent } from './pages/planning-test/planning-test.component';
import { WorkOrderFormEditComponent } from './pages/work-order-form-edit/work-order-form-edit.component';
import { WorkorderreprogramComponent } from './pages/reprogram/work-order-reprogram.component';
import { ProductSearchAddComponent } from './pages/work-order-solution-form/product-search-add.component';
import { FormEvidenciasComponent } from './pages/FormEvidencias/FormEvidencias.component';


@NgModule({
  declarations: [
    WorkOrdersComponent,
    WorkOrderFormComponent,
    WorkOrderDetailsComponent,
    FormEvidenciasComponent,
    AssignToModalComponent,
    WorkSolutionComponent,
    CancelModalComponent,
    WorkOrderSolutionFormComponent,
    PlanningComponent,
    PlanningTestComponent,
    WorkOrderFormEditComponent,
    WorkorderreprogramComponent,
    ProductSearchAddComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    WorkOrdersRoutingModule,
    AngularMultiSelectModule,
    StarRatingModule,
    LightgalleryModule,
    FullCalendarModule,
    CustomersModule,
    
  ],
  providers: [
    DatePipe,
    WorkOrdersComponent,
    WorkOrderFormEditComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class WorkOrdersModule { }
