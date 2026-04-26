import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { DiaryEventsTypesComponent } from './pages/diary-events-types/diary-events-types.component';
import { CalendarUserComponent } from './pages/calendar-user/calendar-user.component';
import { CalendarEmployeeComponent } from './pages/calendar-employee/calendar-employee.component';

const routes: Routes = [
  {
    path: 'general',
    component: CalendarComponent
  },
  {
    path: 'my-calendar',
    component: CalendarUserComponent
  },
  {
    path: 'employee/:id',
    component: CalendarEmployeeComponent
  },
  {
    path: 'event-types',
    component: DiaryEventsTypesComponent
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
export class CalendarRoutingModule { }
