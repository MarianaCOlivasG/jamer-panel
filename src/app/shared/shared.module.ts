import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { InputSearchComponent } from './components/input-search/input-search.component';
import { FormsModule } from '@angular/forms';
import { ImagePipe } from './pipes/image.pipe';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { MapComponent } from './components/map/map.component';
import { SignatureComponent } from './components/signature/signature.component';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EmailsModalComponent } from './components/emails-modal/emails-modal.component';
import { TagInputModule } from 'ngx-chips';
import { MapAddressesComponent } from './components/map-addresses/map-addresses.component';


@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    InputSearchComponent,
    ImagePipe,
    PaginatorComponent,
    MapComponent,
    SignatureComponent,
    TextEditorComponent,
    EmailsModalComponent,
    MapAddressesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AngularSignaturePadModule,
    AngularEditorModule,
    TagInputModule,
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    InputSearchComponent,
    PaginatorComponent,
    ImagePipe,
    MapComponent,
    SignatureComponent,
    TextEditorComponent,
    EmailsModalComponent,
    MapAddressesComponent
  ]
})
export class SharedModule { }
