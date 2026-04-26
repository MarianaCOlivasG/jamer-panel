import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Address } from '../../interfaces/address.interface';
import { CustomersService } from '../../services/customers.service';
import { ActivatedRoute } from '@angular/router';
import { DataContact } from '../../interfaces';

@Component({
  selector: 'contacts-table',
  templateUrl: './contacts-table.component.html',
  styleUrls: ['./contacts-table.component.scss']
})
export class ContactsTableComponent implements OnInit {

  @Output() totalResultsEvent = new EventEmitter<number>();

  public contacts: DataContact[] = [];
  public contactSelected?: DataContact;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public customerId!: number;

  public currentPage: number = 1;

  constructor( public modalService: ModalService,
               private customersService: CustomersService,
               private activatedRoute: ActivatedRoute ) {}
  
               
  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.customerId = +id;
      this.getContactsByCustomerId( this.customerId );
    });
  }


  openModalCreate(){
    this.contactSelected = undefined;
    this.modalService.openModal();
  }

  openModalUpdate( contact?: DataContact){
    this.contactSelected = contact;
    this.modalService.openModal();
  }

  getContactsByCustomerId(customerId: number ) {
    this.isLoading = true;
    this.customersService.getContactsByCustomerId(customerId)
      .subscribe({
        next: (resp: any) => {
          this.contacts = resp['contacts'];
          this.totalResults = this.contacts.length;
          this.totalResultsEvent.emit(this.totalResults)
          this.isLoading = false;
        },
    })
  }


  // changePage( currentPage: number ) {
  //     this.currentPage = currentPage;
  //     this.getContactsByCustomerId( this.customerId )
  // }


  newContact() {
    this.modalService.closeModal();
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getContactsByCustomerId(this.customerId );
  }


}
