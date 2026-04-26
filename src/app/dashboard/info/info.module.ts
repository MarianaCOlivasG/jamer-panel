import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info.component';
import { InfoRoutingModule } from './info-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    InfoComponent
  ],
  imports: [
    CommonModule,
    InfoRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
})
export class InfoModule { }
