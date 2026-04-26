import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Contract } from '../../../interfaces/contract.interface';
import { ContractsService } from '../../../services/contracts.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';

@Component({
  selector: 'contracts-table',
  templateUrl: './contracts-table.component.html',
  styleUrls: ['./contracts-table.component.scss']
})
export class ContractsTableComponent {

  @Output() totalResultsEvent = new EventEmitter<number>();

  public customerId: number = 0;

  public contracts: Contract[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor(  private contractsService: ContractsService,
                private activatedRoute: ActivatedRoute,
                private localStorageService: LocalStorageService,
                private router: Router,
                ) { }
    public create:any;
  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.customerId = +id;
      this.getAll( this.currentPage, this.limit, this.customerId );
    });
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "contracts")?.permissions );
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
  }

  getAll( page: number, limit: number, customerId: number = 0) {
    this.isLoading = true;
    this.contractsService.getAll(page, limit, customerId)
      .subscribe({
        next: (resp: any) => {
          this.contracts = resp.contracts;
          this.totalResults = resp.totalResults;
          this.totalResultsEvent.emit(this.totalResults)
          this.isLoading = false;
        },
    })
  }

  searchContracts( page: number, limit: number, customerId: number, queryString: string) {
    this.isLoading = true;
    this.contractsService.search(page, limit, customerId, queryString)
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
      this.getAll( this.currentPage, this.limit, this.customerId )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchContracts( this.currentPage, this.limit, this.customerId, this.querySearch )

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit, this.customerId )
      } else {
        this.searchContracts( this.currentPage, this.limit, this.customerId, this.querySearch )
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    switch ( formName ) {
      case 'customerId':
          this.getAll( this.currentPage, this.limit, this.customerId)
        break;  
      default:
        break;
    }
  }

}
