import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BudgetsService } from '../../services/budgets.service';
import { Budget } from '../../interfaces/budget.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'budgets-table',
  templateUrl: './budgets-table.component.html',
  styleUrls: ['./budgets-table.component.scss']
})
export class BudgetsTableComponent {

  @Output() totalResultsEvent = new EventEmitter<number>();

  public customerId: number = 0;

  public budgets: Budget[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public create:any;
  constructor(  private budgetsService: BudgetsService,
                private activatedRoute: ActivatedRoute,
                private localStorageService: LocalStorageService,
                private router: Router,
                ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.customerId = +id;
      this.getAll( this.currentPage, this.limit, this.customerId );
    });

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "budgets")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
    // this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
  }

  getAll( page: number, limit: number, customerId: number = 0) {
    this.isLoading = true;
    this.budgetsService.getAll(page, limit, customerId)
      .subscribe({
        next: (resp: any) => {
          this.budgets = resp.budgets;
          console.log({b: this.budgets});
          this.totalResults = resp.totalResults;
          this.totalResultsEvent.emit(this.totalResults)
          this.isLoading = false;
        },
    })
  }

  searchBudgets( page: number, limit: number, customerId: number, queryString: string) {
    this.isLoading = true;
    this.budgetsService.search(page, limit, customerId, queryString)
      .subscribe({
        next: (resp: any) => {
          this.budgets = resp.budgets;
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
    this.searchBudgets( this.currentPage, this.limit, this.customerId, this.querySearch )

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit, this.customerId )
      } else {
        this.searchBudgets( this.currentPage, this.limit, this.customerId, this.querySearch )
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

  goToCreateBudget() {
    this.budgetsService.reset();
    this.budgetsService.customerIdSelected = this.customerId;
    this.router.navigateByUrl('/customers/budgets/new');
  }

}
