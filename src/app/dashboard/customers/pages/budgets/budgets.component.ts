import { Component, HostListener, OnInit } from '@angular/core';
import { Budget } from '../../interfaces/budget.interface';
import { Customer } from '../../interfaces/customer.interface';
import { CustomersService } from '../../services/customers.service';
import { BudgetsService } from '../../services/budgets.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {

  public budgets: Budget[] = [];
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public customerSelected!: Customer | undefined;

  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public customerSearchQuery: string = '';
  public showCustomerDropdown: boolean = false;

  constructor(
    private budgetsService: BudgetsService,
    public modalService: ModalService,
    private customersService: CustomersService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) { }

  public create: any;
  public edit: any;

  ngOnInit(): void {
    this.budgetsService.customerIdSelected = 0;

    this.customersService.getAllWithoutPagination()
      .subscribe({
        next: ({ customers }: any) => {
          this.customers = customers;
          this.filteredCustomers = customers;
          this.customerSelected = undefined;
          this.getAll();
        }
      });

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
    const permissions = (storedPermissions?.find((p) => p.page == "budgets")?.permissions);

    this.create = ((permissions as number >> 1) % 2 == 1) ? true : false;
    this.edit = ((permissions as number >> 2) % 2 == 1) ? true : false;
  }

  openModal() {
    this.modalService.openModal();
  }

  getAll() {
    this.isLoading = true;
    this.budgetsService.getAll(this.currentPage, this.limit, this.customerSelected?.id)
      .subscribe({
        next: (resp: any) => {
          this.budgets = resp.budgets;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        }
      });
  }

  searchBudgets() {
    this.isLoading = true;
    this.budgetsService.search(this.currentPage, this.limit, this.customerSelected?.id, this.querySearch)
      .subscribe({
        next: (resp: any) => {
          this.budgets = resp.budgets;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        }
      });
  }

  search(query: string): void {
    this.currentPage = 1;

    if (query.length == 0) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.getAll();
      return;
    }

    if (query.trim().length == 0) {
      this.isSuggestions = false;
      return;
    }

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchBudgets();
  }

  searchCustomer(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length == 0) {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter(customer =>
        customer.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showCustomerDropdown = true;
  }

  selectCustomer(customer: Customer | undefined): void {
    this.customerSelected = customer;
    this.customerSearchQuery = customer ? customer.name : 'Seleccionar todos los clientes';
    this.showCustomerDropdown = false;
    this.getAll();
  }

  changePage(currentPage: number) {
    this.currentPage = currentPage;
    if (!this.isSuggestions) {
      this.getAll();
    } else {
      this.searchBudgets();
    }
  }

  changeModel(formName: string) {
    this.currentPage = 1;
    this.isSuggestions = false;

    switch (formName) {
      case 'customerId':
        this.isSuggestions = false;
        this.querySearch = '';
        this.getAll();
        break;
      default:
        break;
    }
  }
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.showCustomerDropdown = false;
    }
  }

}