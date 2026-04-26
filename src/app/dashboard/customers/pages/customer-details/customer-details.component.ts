import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Customer } from '../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from '../../services/customers.service';
import { switchMap } from 'rxjs';
import { UploadsService } from 'src/app/shared/services/uploads.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.development';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;
  public fileUrl: string = environment.apiUrl;
  public isBudget: boolean = true;

  public customer!: Customer; 

  public isLoading: boolean = true;

  public totals: any = { 
    addresses: 0,
    budgets: 0,
    contracts: 0,
    workOrders: 0,
    sales:0
  };


  constructor( private activatedRoute: ActivatedRoute,
               private customersService: CustomersService,
               private uploadsService: UploadsService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}


public edit:any;
  ngOnInit(): void {
    
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.customersService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.customer = resp.customer;
        this.customer.address = `${this.customer.address_street} ${this.customer.address_colony} ${this.customer.address_no_ext} ${this.customer.address_no_int} CP ${this.customer.address_cp}, ${this.customer.address_municipality} ${this.customer.address_state}`;

       
        this.isLoading = false;
      });
      const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

      const permissions = (storedPermissions?.find((p)=> p.page == "customer")?.permissions );
      ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
      this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 

  }


  getTotals( total: number, entity: string ) {
    this.totals[entity] = total;
  }


  openSelectFile() {
    this.fileInput.nativeElement.click()
    
  }


  onChangeFileInput( files: any ) {
    const file = files[0];

    if ( !files[0] ) return;

    this.uploadsService.uploadCustomerCSFFile( this.customer.id, file )
      .subscribe({
        next: (resp: any) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.customer.csfFile = resp.filename;
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
      })
  }

}
