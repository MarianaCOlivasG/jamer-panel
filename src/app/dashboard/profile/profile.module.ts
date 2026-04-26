import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmployeesModule } from '../employees/employees.module';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { UserIncidencesComponent } from './pages/user-incidences/user-incidences.component';
import { UserBonusesComponent } from './pages/user-bonuses/user-bonuses.component';



@NgModule({
  declarations: [
    ProfileComponent,
    UserMenuComponent,
    UserIncidencesComponent,
    UserBonusesComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    EmployeesModule
  ]
})
export class ProfileModule { }
