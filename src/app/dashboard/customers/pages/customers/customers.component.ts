import { Component } from '@angular/core';
import { Customer, CustomerType } from '../../interfaces';
import { CustomersService } from '../../services/customers.service';
import { switchMap } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {

  public fileUrl: string = environment.apiUrl;

  public customers: Customer[] = [];
  public customersTypes: CustomerType[] = [{ id: 0, key:'all', value: 'TODOS' }];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public typeSelected!: CustomerType;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public modalSelected: 'agendar' | 'emails' | 'facturas' = 'agendar';

  public customerSelected!: Customer;

  constructor( private customersService: CustomersService,
               public modalService: ModalService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) { }
  public create: any;
  public edit:any;
  public invoice:any;
  public contact:any;
  ngOnInit(): void {

    this.customersService.getAllTypes()
      .subscribe({
        next: ({customersTypes}: any) => {
          this.customersTypes = [{ id: 0, key:'all', value: 'TODOS' }, ...customersTypes];
          this.typeSelected = this.customersTypes[0];
          
          this.getAll( this.currentPage, this.limit, this.typeSelected.id )
        },
    });
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "customer")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.invoice =  ((permissions as number >> 3 ) % 2 == 1)? true :false; 
     this.contact =  ((permissions as number >> 4 ) % 2 == 1)? true :false; 

  }




  getAll( page: number, limit: number, typeId: number) {
    this.isLoading = true;
    this.customersService.getAll(page, limit, typeId)
      .subscribe({
        next: (resp: any) => {
          this.customers = resp.customers;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchCustomers( page: number, limit: number, typeId: number, queryString: string) {
    this.isLoading = true;
    this.customersService.search(page, limit, typeId, queryString)
      .subscribe({
        next: (resp: any) => {
          this.customers = resp.customers;
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
      this.getAll( this.currentPage, this.limit, this.typeSelected.id )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchCustomers( this.currentPage, this.limit, this.typeSelected.id, this.querySearch )

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit, this.typeSelected.id )
      } else {
        this.searchCustomers( this.currentPage, this.limit, this.typeSelected.id, this.querySearch )
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    switch ( formName ) {
      case 'typeId':
          this.getAll( this.currentPage, this.limit, this.typeSelected.id )
        break;  
      default:
        break;
    }
  }


  agendar( customer: Customer ) {
    this.modalSelected = 'agendar';
    this.customerSelected = customer;
    this.modalService.openModal();
  }

  sendEstadoDeCuenta( customer: Customer ) {
    this.modalSelected = 'emails';
    this.modalService.openModal();
    this.customerSelected = customer;
  }


  downloadEstadoDeCuenta( customer: Customer ) {
    this.customersService.downloadEmail( customer.id ) 
      .subscribe({
        next: ( resp ) => {
          
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

          const path = `${this.fileUrl}/uploads/docs/estados-de-cuenta/${resp.pdfName}`;
          window.open(path, '_blank');

        },
        error: ( error ) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }


  showFacturas( customer: Customer ) {
    this.modalSelected = 'facturas';
    this.modalService.openModal();
    this.customerSelected = customer;
  }

}
