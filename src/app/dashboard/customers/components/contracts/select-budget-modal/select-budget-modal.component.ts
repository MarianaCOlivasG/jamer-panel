import { Component } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { BudgetsService } from '../../../services/budgets.service';
import { CustomersService } from '../../../services/customers.service';
import { Budget } from '../../../interfaces/budget.interface';
import { Customer } from '../../../interfaces';
import { ContractsService } from '../../../services/contracts.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-budget-modal',
  templateUrl: './select-budget-modal.component.html',
  styleUrls: ['./select-budget-modal.component.scss']
})
export class SelectBudgetModalComponent {


  public budgets: Budget[] = [];
  public customers: Customer[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public customerSelected!: Customer | undefined;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  public componentName: string = '';

  constructor(  private router: Router, 
                private activatedRoute: ActivatedRoute,
                private budgetsService: BudgetsService,
                private contractsService: ContractsService,
                private customersService: CustomersService,
                private modalService: ModalService ) { }

  ngOnInit(): void {

    this.componentName = this.activatedRoute.component?.name!;

    this.customersService.getAllWithoutPagination()
      .subscribe({
        next: ({customers}: any) => {
          this.customers = customers;
          this.customerSelected = undefined;
          this.getAll()
        },
    });

  }




  getAll() {
    this.isLoading = true;
    this.budgetsService.getAll(this.currentPage, this.limit, this.customerSelected?.id)
      .subscribe({
        next: (resp: any) => {
          this.budgets = resp.budgets;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchBudgets() {
    this.isLoading = true;
    this.budgetsService.search(this.currentPage, this.limit, this.customerSelected?.id, this.querySearch)
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
      this.getAll()
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchBudgets()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll()
      } else {
        this.searchBudgets()
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

  closeModal() {  
    this.modalService.closeModal();
  }


  selectBudget( budgetId: number ) {
    this.modalService.closeModal();
    this.contractsService.giveBudgetId(budgetId);
    if ( this.componentName == 'ContractFormComponent' ) return;
    this.router.navigateByUrl('/customers/contracts/new');
  }

}
