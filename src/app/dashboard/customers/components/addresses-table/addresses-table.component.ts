import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Address } from '../../interfaces/address.interface';
import { CustomersService } from '../../services/customers.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'addresses-table',
  templateUrl: './addresses-table.component.html',
  styleUrls: ['./addresses-table.component.scss']
})
export class AddressesTableComponent implements OnInit {

  @Output() totalResultsEvent = new EventEmitter<number>();

  public addresses: Address[] = [];
  public addressSelected?: Address;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public customerId!: number;

  constructor( public modalService: ModalService,
               private customersService: CustomersService,
               private activatedRoute: ActivatedRoute ) {}
  
               
  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.customerId = +id;
      this.getAllByCustomerId( this.currentPage, this.limit, this.customerId );
    });
  }


  openModalCreate(){
    this.addressSelected = undefined;
    this.modalService.openModal();
  }

  openModalUpdate( address?: Address){
    this.addressSelected = address;
    this.modalService.openModal();
  }

  getAllByCustomerId( page: number, limit: number, customerId: number ) {
    this.isLoading = true;
    this.customersService.getAllAddressByCustomerId(page, limit, customerId)
      .subscribe({
        next: (resp: any) => {
          this.addresses = resp.addresses;
          console.log(this.addresses);
          this.totalResults = resp.totalResults;
          this.totalResultsEvent.emit(this.totalResults)
          this.isLoading = false;
        },
    })
  }

  searchAddresses( page: number, limit: number, customerId: number, queryString: string) {
    this.isLoading = true;
    this.customersService.searchAddress(page, limit, customerId, queryString)
      .subscribe({
        next: (resp: any) => {
          this.addresses = resp.addresses;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  search( query:string ):void {

    this.currentPage = 1;

    if ( query.length == 0 ) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.getAllByCustomerId( this.currentPage, this.limit, this.customerId )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchAddresses( this.currentPage, this.limit, this.customerId, this.querySearch )

  }


  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAllByCustomerId( this.currentPage, this.limit, this.customerId )
      } else {
        this.searchAddresses( this.currentPage, this.limit, this.customerId, this.querySearch )
      }
  }


  newAddress() {
    this.modalService.closeModal();
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getAllByCustomerId( this.currentPage, this.limit, this.customerId );
  }


}
