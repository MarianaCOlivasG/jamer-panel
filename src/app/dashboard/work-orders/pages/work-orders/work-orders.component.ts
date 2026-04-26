import { Component, OnInit, HostListener } from '@angular/core';
import { WorkOrdersService } from '../../services/work-orders.service';
import { WorkOrder } from '../../interfaces/work-order.interface';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { Customer } from 'src/app/dashboard/customers/interfaces';
import { CustomersService } from 'src/app/dashboard/customers/services/customers.service';
import { combineLatest } from 'rxjs';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.component.html',
  styleUrls: ['./work-orders.component.scss']
})
export class WorkOrdersComponent implements OnInit {

  public fileUrl: string = environment.apiUrl;

  public workOrders: WorkOrder[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public employeesIds: string | number= '';
  public date: string = '';
  public customerId: number = 0;

  public isSuggestions: boolean = false;
  public querySearch: string = '';    

  public technicals: MultiSelectData[] = [];
  public filteredTechnicals: MultiSelectData[] = [];
  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];

  public workOrderSelected: WorkOrder | null = null;
  public currentTechnicals: number[] = [];

  public modalSelected: 'assign' | 'cancel' | 'emails' | '' = '';
  public statusId: number = 0; 

  public technicalSearchQuery: string = '';
  public customerSearchQuery: string = '';
  public showTechnicalDropdown: boolean = false;
  public showCustomerDropdown: boolean = false;
  
  public status: string = 'Inactivo'; 

  constructor( private workOrdersService: WorkOrdersService,
               private employeesService: EmployeesService,
               private customersService: CustomersService,
               public modalService: ModalService,
               private socketsRouteService: SocketsRouteService,
               private authService: AuthService ,
               private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) { }

  public create: any;
  public edit:any;
  public deleted:any;

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
    const permissions = (storedPermissions?.find((p)=> p.page == "work orders")?.permissions );
    if (!((permissions as number >> 0) % 2 === 1)) {
        this.router.navigate(['/calendar/my-calendar']);
        return; 
    }
    this.create =  ((permissions as number >> 1) % 2 === 1); 
    this.edit =  ((permissions as number >> 2) % 2 === 1); 
    this.deleted =  ((permissions as number >> 3) % 2 === 1);
    

    this.activatedRoute.params.subscribe( ({statusId}) => {
      this.statusId = +statusId; 
      this.currentPage = 1;   
      combineLatest([   
          this.employeesService.getTechnicalsWithoutPagination(),
          this.customersService.getAllWithoutPagination()
        ])
        .subscribe( combined => {
          this.technicals = combined[0] as any;
          this.filteredTechnicals = [...this.technicals]; // Reset filtered list
          this.customers = combined[1].customers.sort((a: Customer, b: Customer) => {
            return a.name.localeCompare(b.name);
          });
          this.filteredCustomers = [...this.customers]; 
          this.search(this.querySearch); 
        });
    });
  }

  setStatus(newStatus: string): void {
    this.status = newStatus;
    this.currentPage = 1;
    this.search(this.querySearch); 
  }



  getAll() {
    this.isLoading = true;
    this.workOrdersService.getAll(
      this.currentPage, 
      this.limit, 
      this.employeesIds.toString(), 
      this.customerId, 
      this.statusId, 
      this.date,
      (this.statusId == 3) ? 0 : 2, 
    )
      .subscribe({
        next: (resp: any) => {
          this.workOrders = resp.workOrders;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false;  }
    });
  }

  searchWorkOrders() {
    this.isLoading = true;
    const searchQuery = (this.status === 'Activo' && this.querySearch.length === 0) 
                        ? 'RR' 
                        : (this.status === 'Activo' ? this.querySearch + 'RR' : this.querySearch);

    this.workOrdersService.search(
      this.currentPage, 
      this.limit, 
      searchQuery,
      this.employeesIds.toString(), 
      this.customerId, 
      this.statusId,
      this.date,
      (this.statusId == 3) ? 0 : 2, 
    )
      .subscribe({
        next: (resp: any) => {
          this.workOrders = resp.workOrders;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false;}
    });
  }

  search(query: string): void {
    this.querySearch = query.trim(); 
    this.currentPage = 1;          

    if (this.querySearch.length === 0) { 
      this.isSuggestions = false;
      if (this.status === 'Activo') {
        this.searchWorkOrders(); 
      } else {
        this.getAll();
      }
      return;
    }

    this.isSuggestions = true;
    this.searchWorkOrders(); 
  }

  searchTechnical(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.technicalSearchQuery = query; 
    if (query.length == 0) {
      this.filteredTechnicals = [...this.technicals];
    } else {
      this.filteredTechnicals = this.technicals.filter(technical =>
        technical.itemName.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showTechnicalDropdown = true;
  }

  selectTechnical(technical: MultiSelectData | undefined): void {
    this.employeesIds = technical ? technical.id : '';
    this.technicalSearchQuery = technical ? technical.itemName : 'Ver todos'; 
    this.showTechnicalDropdown = false;
    this.currentPage = 1; 
    this.search(this.querySearch);
  }

  searchCustomer(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.customerSearchQuery = (event.target as HTMLInputElement).value; 
    if (query.length === 0) {
      this.filteredCustomers = [...this.customers];
    } else {
      const queryParts = query.split(/\s+/).filter(Boolean);
      this.filteredCustomers = this.customers.filter(customer => {
        const fullName = (customer.name + " " + (customer.lastName || "")).toLowerCase();
        return queryParts.every(part => fullName.includes(part));
      });
    }
    this.showCustomerDropdown = true;
  }

  selectCustomer(customer: Customer | undefined): void {
    this.customerId = customer ? customer.id : 0;
    this.customerSearchQuery = customer ? `${customer.name} ${customer.lastName || ''}`.trim() : 'Ver todos'; 
    this.showCustomerDropdown = false;
    this.currentPage = 1; 
    this.search(this.querySearch); 
  }

  changePage(newPage: number) {
    this.currentPage = newPage;
    if (this.isSuggestions || this.querySearch.length > 0 || this.status === 'Activo') {
      this.searchWorkOrders();
    } else {
      this.getAll();
    }
  }

  changeModel(formName: string) { 
    this.currentPage = 1; // Reset page
    this.search(this.querySearch);
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.technical-dropdown-parent')) {
      this.showTechnicalDropdown = false;
    }
    if (!target.closest('.customer-dropdown-parent')) { 
      this.showCustomerDropdown = false;
    }
  }


  assingToEvent() {
    this.workOrderSelected = null;
    this.modalService.closeModal();
    this.changePage(this.currentPage); 
  }

  openModal(workOrder: WorkOrder, modalSelected: 'assign' | 'cancel' | 'emails') {
    this.modalSelected = modalSelected;
    this.workOrderSelected = workOrder;
    if (modalSelected === 'assign') {
      this.currentTechnicals = workOrder!.employees.map(employee => employee.id);
    }
    this.modalService.openModal();
  }

  closeModal() {
    this.modalSelected = '';
    this.workOrderSelected = null;
    this.modalService.closeModal();
  }

  async deleteWorkOrder(workOrderId: number | string) {
    const workOrder = this.workOrders.find(wo => wo.id == workOrderId);
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se eliminará la orden de trabajo con el folio ${ workOrder?.folio }`,
      confirmButtonText: `¡Si, eliminar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });

    if (!isConfirmed) return;


    this.socketsRouteService.deleteWorkOrder(workOrderId)
    .subscribe({
      next: (resp) => {
        Swal.fire({
          text: resp.message,
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        });
        this.changePage( this.currentPage ); 
        this.closeModal();
      },
      error: (error) => {
        Swal.fire({
          text: error.error?.message || error.message || 'Error al eliminar la orden de trabajo',
          icon: 'error',
          timer: 2500,
          showConfirmButton: false
        });
      }
    });
  }

  onFinishEvent() {
    this.closeModal(); 
  }

  sendToEmail(workOrder: WorkOrder){
    this.openModal(workOrder, 'emails');
  }

  generatePDF(workOrderId: string) {
    Swal.fire({
      text: 'Generando PDF, Por favor espere...',
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    this.workOrdersService.generatePDF(+workOrderId)
      .subscribe({
        next: (resp) => {
          Swal.close();
          Swal.fire({
            text: resp.message,
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
          });
          const path = `${this.fileUrl}/uploads/docs/workOrders/${resp.fileName}`;
          window.open(path, '_blank');
        },
        error: (error) => {
          Swal.close(); 
          Swal.fire({
            text: error.error?.message || error.message || 'Error al generar PDF',
            icon: 'error',
            timer: 2500,
            showConfirmButton: false
          });
        }
      });
  }

  async changeIsValidate(workOrderId: string) {
    const workOrder = this.workOrders.find(wo => wo.id == workOrderId);
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `La orden de trabajo con el folio ${ workOrder?.folio } se marcará como 'verificada'.`,
      confirmButtonText: `¡Si, verificar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });

    if (!isConfirmed) return;

    this.workOrdersService.markAsValidated(workOrderId)
      .subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
          });
          this.search(this.querySearch); 
        },
        error: (error) => {
          Swal.fire({
            text: error.error?.message || error.message || 'Error al marcar como validada',
            icon: 'error',
            timer: 2500,
            showConfirmButton: false
          });
        }
      });
  }
}