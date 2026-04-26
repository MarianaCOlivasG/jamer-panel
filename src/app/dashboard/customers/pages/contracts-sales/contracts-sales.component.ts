import { Component, OnInit, HostListener } from '@angular/core';
import { Budget } from '../../interfaces/budget.interface';
import { Customer } from '../../interfaces';
import { CustomersService } from '../../services/customers.service';
import { BudgetsService } from '../../services/budgets.service';
import { Contract } from '../../interfaces/contract.interface';
import { ContractsService } from '../../services/contracts.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { WorkOrder } from 'src/app/dashboard/work-orders/interfaces/work-order.interface';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts-sales.component.html',
  styleUrls: ['./contracts-sales.component.scss']
})
export class ContractsSalesComponent implements OnInit {

  public contracts: WorkOrder[] = [];
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public isOnlySale: number = 1;
  public customerSelected!: Customer | undefined;

  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public customerSearchQuery: string = '';
  public showCustomerDropdown: boolean = false;

  constructor(
    private contractsService: ContractsService,
    private customersService: CustomersService,
    public modalService: ModalService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private workOrdersService: WorkOrdersService,
  ) { }

  ngOnInit(): void {
    this.customersService.getAllWithoutPagination()
      .subscribe({
        next: ({customers}: any) => {
          this.customers = customers;
          this.filteredCustomers = customers;
          this.customerSelected = undefined;
          this.getAll();
        },
    });

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
    const permissions = (storedPermissions?.find((p) => p.page == "sale")?.permissions);

  }

  openModal() {
    this.modalService.openModal();
  }

  getAll() {
    this.isLoading = true;
    
    this.workOrdersService.getAll(this.currentPage, this.limit, '', (this.customerSelected?.id != undefined) ? this.customerSelected.id : 0, 0, '', 2).subscribe({
      next: (resp: any) => {
        resp.workOrders = resp.workOrders.filter((workOrder: WorkOrder) => workOrder.isBudget === true);
        this.contracts = resp.workOrders;
        resp.totalResults = resp.workOrders.length;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  searchContracts(): void {
    this.isLoading = true;
    this.workOrdersService.search(this.currentPage, this.limit, this.querySearch, '', (this.customerSelected?.id != undefined) ? this.customerSelected.id : 0, 0, '', 2).subscribe({
      next: (resp: any) => {
        resp.workOrders = resp.workOrders.filter((workOrder: WorkOrder) => workOrder.isBudget === true);
        this.contracts = resp.workOrders;
        resp.totalResults = resp.workOrders.length;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
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
    this.searchContracts();
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
      this.searchContracts();
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