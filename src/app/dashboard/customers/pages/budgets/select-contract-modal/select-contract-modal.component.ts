import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ContractsService } from '../../../services/contracts.service';
import { CustomersService } from '../../../services/customers.service';
import { Contract } from '../../../interfaces/contract.interface';
import { Customer } from '../../../interfaces/customer.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-contract-modal',
  templateUrl: './select-contract-modal.component.html',
  styleUrls: ['./select-contract-modal.component.scss']
})
export class SelectContractModalComponent implements OnInit {

  @Input() budgetId!: number; 

  public contracts: Contract[] = [];
  public customers: Customer[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public customerSelected!: Customer | undefined;

  public componentName: string = '';

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private contractsService: ContractsService, 
    private customersService: CustomersService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {

    this.componentName = this.activatedRoute.component?.name!;

    this.customersService.getAllWithoutPagination()
      .subscribe({
        next: ({customers}: any) => {
          this.customers = customers;
          this.customerSelected = undefined;
          this.getAll(); // Fetch contracts after loading customers
        },
        error: (err) => {
          console.error('Error fetching customers:', err);
          this.isLoading = false;
        }
    });

  }

  getAll() {
    this.isLoading = true;
    if (this.budgetId) {
      // Call the new function using budgetId
      this.contractsService.getAllByBudgetId(this.currentPage, this.limit, this.budgetId, 0)
        .subscribe({
          next: (resp: any) => {
            this.contracts = resp.contracts;
            this.totalResults = resp.totalResults;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching contracts by budgetId:', err);
            this.isLoading = false;
          }
      });
    } else {
      // Default behavior if no budgetId is provided
      this.contractsService.getAll(this.currentPage, this.limit, this.customerSelected?.id || 0, 0)
        .subscribe({
          next: (resp: any) => {
            this.contracts = resp.contracts;
            this.totalResults = resp.totalResults;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching contracts:', err);
            this.isLoading = false;
          }
      });
    }
  }

  changePage(currentPage: number) {
    this.currentPage = currentPage;
    this.getAll(); // Fetch contracts for the new page
  }

  changeModel(formName: string) {
    this.currentPage = 1;

    switch (formName) {
      case 'customerId':
        this.getAll(); // Fetch contracts when customer changes
        break;  
      default:
        break;
    }
  }

  closeModal() {  
    this.modalService.closeModal();
    this.modalService.name = "";
  }

  selectContract(contractId: number) {
    this.modalService.closeModal();
    this.contractsService.giveContractId(contractId);
    if (this.componentName == 'ContractFormComponent') return;
    this.router.navigateByUrl(`/work-orders/new?contractId=${contractId}&typeWork=contract`);
  }

}
