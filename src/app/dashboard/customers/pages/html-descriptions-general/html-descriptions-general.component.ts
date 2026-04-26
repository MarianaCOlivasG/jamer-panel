import { Component } from '@angular/core';
import { HtmlDescription } from '../../interfaces/html-description.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { HtmlDescriptionsGeneralService } from '../../services/html-descriptions-general.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-html-descriptions-general',
  templateUrl: './html-descriptions-general.component.html',
  styleUrls: ['./html-descriptions-general.component.scss']
})
export class HtmlDescriptionsGeneralComponent {

  public htmlDescriptionSelected!: HtmlDescription | null;
  public htmlDescriptions: HtmlDescription[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 

  constructor( public modalService: ModalService,
               private htmlDescriptionsService: HtmlDescriptionsGeneralService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){

  }
  public create: any;
  public edit:any;
  public deleted:any;

  ngOnInit(): void {
    this.getAllHtmlDescriptions();

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "template")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
  }


  getAllHtmlDescriptions() {
    this.htmlDescriptionsService.getAll()
      .subscribe({
        next: ({htmlDescriptions}: any) => {
          this.htmlDescriptions = htmlDescriptions;
          this.totalResults = this.htmlDescriptions.length;
          this.isLoading = false;
        },
    });
  }

  handleCreate() {
    this.modalService.openModal();
    this.htmlDescriptionSelected = null;
  }

  handleUpdate( htmlDescriptions: HtmlDescription ) {
    this.modalService.openModal();
    this.htmlDescriptionSelected = htmlDescriptions;
  }

  handleDelete( id: number, idx: number ) {
    this.htmlDescriptionsService.remove( id )
      .subscribe({
        next: ( resp ) => {
          this.htmlDescriptions.splice(idx, 1);
          this.totalResults = this.htmlDescriptions.length;

          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

        },
        error: ( error ) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }


  newHtmlDescriptionEvent() {
    this.modalService.closeModal();
    this.getAllHtmlDescriptions();
  }

}
