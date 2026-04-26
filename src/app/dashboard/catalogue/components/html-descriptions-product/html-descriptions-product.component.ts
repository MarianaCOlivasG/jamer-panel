import { Component, Input } from '@angular/core';
import { HtmlDescription } from 'src/app/dashboard/customers/interfaces/html-description.interface';
import { HtmlDescriptionsService } from 'src/app/dashboard/customers/services/html-descriptions.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'html-descriptions-product',
  templateUrl: './html-descriptions-product.component.html',
  styleUrls: ['./html-descriptions-product.component.scss']
})
export class HtmlDescriptionsProductComponent {

  @Input() productId: number = 0;

  public htmlDescriptionSelected!: HtmlDescription | null;
  public htmlDescriptions: HtmlDescription[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 

  constructor( public modalService: ModalService,
               private htmlDescriptionsService: HtmlDescriptionsService ){

  }

  ngOnInit(): void {
    this.getAllHtmlDescriptions();
  }

  getAllHtmlDescriptions() {
    this.htmlDescriptionsService.getAllByProductId( this.productId )
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
