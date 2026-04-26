import { Component } from '@angular/core';
import { Budget } from '../../interfaces/budget.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetsService } from '../../services/budgets.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Swal from 'sweetalert2';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { ContractsService } from '../../services/contracts.service';
import { Contract } from '../../interfaces/contract.interface';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { WorkOrder } from 'src/app/dashboard/work-orders/interfaces/work-order.interface';
@Component({
  selector: 'app-budget-details',
  templateUrl: './budget-details.component.html',
  styleUrls: ['./budget-details.component.scss']
})
export class BudgetDetailsComponent {
openModalContract() {
  this.modalService.openModal();
  this.modalService.name= "Contracts";
}

public contracts: Contract[] = [];
public isContractsLoading: boolean = false;
public workOrders: WorkOrder[] = [];
public isWorkOrdersLoading: boolean = false;
public totals: { [key: string]: number } = { contracts: 0, workOrdersContact: 0, workOrdersContractSale: 0 };
public workOrdersContact: WorkOrder[] = [];
public workOrdersContractSale: WorkOrder[] = [];
public desgloseIva: boolean = false;

  public budget!: Budget; 

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;


  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
               private budgetsServices: BudgetsService,
               public authService: AuthService,
               public modalService: ModalService,
              private location: Location,
              private budgetsService: BudgetsService,
              private contractsService: ContractsService,
               private localStorageService: LocalStorageService,
               private workOrdersService: WorkOrdersService,
               ){}
               public edit:any;
               public createContractVal:any;
               public createWorkOrderVal: any;

public budgetId:number=0;
  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.budgetsServices.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.budget = resp.budget;
        console.log({b: this.budget});
        this.budgetId= resp.budget.id as number;
        this.getContracts(); 
        this.getWorkOrders();
        this.isLoading = false;
      });
      const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
      const permissions = (storedPermissions?.find((p)=> p.page == "budgets")?.permissions );
       this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 

       const permissionsContracts = (storedPermissions?.find((p)=> p.page == "contracts")?.permissions );
       this.createContractVal =  ((permissionsContracts as number >> 1 ) % 2 == 1)? true :false;  
       
      const permissionsWorkOrder = (storedPermissions?.find((p)=> p.page == "work orders")?.permissions );
      this.createWorkOrderVal =  ((permissionsWorkOrder as number >> 1 ) % 2 == 1)? true :false; 
  }

  getWorkOrders() {
    this.isWorkOrdersLoading = true;
    this.workOrdersService.getWorkOrdersByBudgetId(this.budgetId)
      .subscribe({
        next: (resp: any) => {
          this.workOrders = resp.workOrders;
          this.workOrdersContact = this.workOrders.filter(wo => wo.typeWork == 'contract');
          console.log(resp.workOrders)
          this.workOrdersContractSale = this.workOrders.filter(wo => wo.typeWork == 'contract-sale');
          this.totals['workOrdersContact'] = this.workOrdersContact.length;
          this.totals['workOrdersContractSale'] = this.workOrdersContractSale.length;
          this.isWorkOrdersLoading = false;
        },
        error: (err) => {
          console.error('Error fetching work orders:', err);
          this.isWorkOrdersLoading = false;
        }
      });
  }
  
  
  getContracts() {
    this.isContractsLoading = true;
    this.contractsService.getAllByBudgetId(1,30,this.budgetId,0)
      .subscribe({
        next: (resp: any) => {
          this.contracts = resp.contracts;
          this.totals['contracts'] = this.contracts.length;
          this.isContractsLoading = false;
        },
        error: (err) => {
          console.error('Error fetching contracts:', err);
          this.isContractsLoading = false;
        }
      });
  }
  
  openModal() {
    this.modalService.openModal();
    this.modalService.name= "email";

  }

  goToBack() {
    this.location.back();
  }


  createContract() {

  }

  navigateToWorkOrderFromBudget(budgetId: number) {
    this.router.navigate(['/work-orders/new', budgetId]);
  }
  createWorkOrder() {

  }


  async downloadPDF() {
    const resp = await this.budgetsServices.downloadPDF( +this.budget.id, this.desgloseIva );
    window.open(`${this.fileUrl}/uploads/docs/budgets/${resp.pdfName}`, '_blank');
  }
  selectBudget( budgetId: number ) {
    this.contractsService.giveBudgetId(budgetId);
    this.router.navigateByUrl('/customers/contracts/new');
  }
}
