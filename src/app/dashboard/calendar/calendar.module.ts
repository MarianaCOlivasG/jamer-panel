import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { CalendarRoutingModule } from './calendar-routing.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DiaryEventModalComponent } from './components/diary-event-modal/diary-event-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DiaryEventsTypesComponent } from './pages/diary-events-types/diary-events-types.component';
import { DiaryEventTypeModalComponent } from './components/diary-event-type-modal/diary-event-type-modal.component';
import { CalendarUserComponent } from './pages/calendar-user/calendar-user.component';
import { CalendarEmployeeComponent } from './pages/calendar-employee/calendar-employee.component';



@NgModule({
  declarations: [
    CalendarComponent,
    DiaryEventModalComponent,
    DiaryEventTypeModalComponent,
    DiaryEventsTypesComponent,
    CalendarUserComponent,
    CalendarEmployeeComponent
  ],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    FullCalendarModule,
    ReactiveFormsModule,
    AngularMultiSelectModule
  ],
  providers: [
    DatePipe
  ]
})
export class CalendarModule { }
