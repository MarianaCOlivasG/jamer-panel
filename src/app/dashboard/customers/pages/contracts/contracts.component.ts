import { Component } from '@angular/core';
import { Customer } from '../../interfaces';
import { CustomersService } from '../../services/customers.service';
import { Contract } from '../../interfaces/contract.interface';
import { ContractsService } from '../../services/contracts.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss']
})
export class ContractsComponent {

  public contracts: Contract[] = [];
  public customers: Customer[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public customerSelected!: Customer | undefined;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor(  private contractsService: ContractsService,
                private customersService: CustomersService,
                public modalService: ModalService,
                private localStorageService: LocalStorageService,
                private router: Router,
                ) { }
                public create: any;
                public createContract: any;

  ngOnInit(): void {

    this.customersService.getAllWithoutPagination()
      .subscribe({
        next: ({customers}: any) => {
          this.customers = customers;
          this.customerSelected = undefined;
          this.getAll()
        },
    });
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "contracts")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false;  
    const permissionsContracts = (storedPermissions?.find((p)=> p.page == "work orders")?.permissions );
    this.createContract =  ((permissionsContracts as number >> 1 ) % 2 == 1)? true :false; 

   
 

  }




  getAll() {
    this.isLoading = true;
    this.contractsService.getAll(this.currentPage, this.limit, this.customerSelected?.id)
      .subscribe({
        next: (resp: any) => {
          this.contracts = resp.contracts;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchContracts() {
    this.isLoading = true;
    this.contractsService.search(this.currentPage, this.limit, this.customerSelected?.id, this.querySearch)
      .subscribe({
        next: (resp: any) => {
          this.contracts = resp.contracts;
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
      this.getAll()
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchContracts()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll()
      } else {
        this.searchContracts()
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    switch ( formName ) {
      case 'customerId':
          this.isSuggestions = false;
          this.querySearch = '';
          this.getAll()
        break;  
      default:
        break;
    }
  }

  openModal() {
    this.modalService.openModal();
  }

}
