import { Component, OnInit } from '@angular/core';
import { StoresService } from '../../services/stores.service';
import { Store } from '../../interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { Employee } from 'src/app/dashboard/employees/interfaces';
import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Router } from '@angular/router';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {

  public stores: Store[] = [];
  public isLoading: boolean = false;
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public employeeId: number = 0;
  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public employees: Employee[] = [];
  public totalInStock: number = 0;

  // Nuevo flag para habilitar la vista agregada
  public aggregatedViewEnabled: boolean = false;

  constructor( private storesService: StoresService,
               public authService: AuthService,
               private employeesService: EmployeesService,
               private localStorageService: LocalStorageService,
               private router: Router,
               private productsService: ProductsService ) { }
               
  public create: any;
  public edit: any;
  public deleted: any;

  ngOnInit(): void {
    combineLatest([   
      this.employeesService.getAllWithoutPagination(),

    ])
    .subscribe( combined => {
      this.employees = combined[0].employees.filter((employee: Employee) => employee.user.isActive);
    });

    this.getAll(this.currentPage, this.limit, this.employeeId);

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions);
    ((permissions as number >> 0 ) % 2 == 1)? true : this.router.navigate(['/calendar/my-calendar']);
    this.create = ((permissions as number >> 1 ) % 2 == 1)? true : false; 
    this.edit   = ((permissions as number >> 2 ) % 2 == 1)? true : false; 
    this.deleted= ((permissions as number >> 3 ) % 2 == 1)? true : false;
  }

  getAll(page: number, limit: number, employeeId: number): void {
    this.isLoading = true;
    this.storesService.getAll(page, limit, employeeId)
      .subscribe({
        next: (resp: any) => {
          this.stores = resp.stores;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  searchStores(page: number, limit: number, employeeId: number, queryString: string): void {
    this.isLoading = true;
    this.storesService.search(page, limit, employeeId, queryString)
      .subscribe({
        next: (resp: any) => {
          this.stores = resp.stores;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  search(query: string): void {
    this.currentPage = 1;
    if (query.length === 0) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.getAll(this.currentPage, this.limit, this.employeeId);
      return;
    }
    if (query.trim().length === 0) {
      this.isSuggestions = false;
      return;
    }
    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchStores(this.currentPage, this.limit, this.employeeId, this.querySearch);
  }

  changePage(currentPage: number): void {
    this.currentPage = currentPage;
    if (!this.isSuggestions) {
      this.getAll(this.currentPage, this.limit, this.employeeId);
    } else {
      this.searchStores(this.currentPage, this.limit, this.employeeId, this.querySearch);
    }
  }

  async disableOrEnable(store: Store): Promise<void> {
    const { isActive, id } = store;
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Estás seguro que deseas ${!isActive ? 'habilitar' : 'deshabilitar'} el almacén?`,
      confirmButtonText: `¡Si, ${!isActive ? 'habilitar' : 'deshabilitar'}!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });
    if (!isConfirmed) return;
    this.storesService.disableOrEnable(id)
      .subscribe({
        next: (resp: any) => {
          Swal.fire({
            icon: 'success',
            text: resp.message,
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          store.isActive = !isActive;
        },
        error: (error) => {
          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      });
  }

  changeModel(formName: string): void {
    this.currentPage = 1;
    this.isSuggestions = false;
    switch (formName) {
      case 'employeeId':
        this.getAll(this.currentPage, this.limit, this.employeeId);
        break;  
      default:
        break;
    }
  }
}