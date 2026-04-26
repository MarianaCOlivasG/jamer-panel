import { Component } from '@angular/core';
import { Supplier, SuppliersType } from '../../interfaces';
import { SuppliersService } from '../../services/suppliers.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent {

  public suppliers: Supplier[] = [];
  public suppliersTypes: SuppliersType[] = [{ id: 0, key:'all', value: 'TODOS' }];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public typeSelected!: SuppliersType;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor( private suppliersService: SuppliersService,
               public authService: AuthService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) { }
               public create: any;
               public edit:any;
               public deleted:any;
               public contact:any;
  ngOnInit(): void {
    
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "suppliers")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
     this.contact =  ((permissions as number >> 4 ) % 2 == 1)? true :false;

    this.suppliersService.getAllTypes()
      .subscribe({
        next: ({suppliersTypes}: any) => {
          this.suppliersTypes = [{ id: 0, key:'all', value: 'TODOS' }, ...suppliersTypes];
          this.typeSelected = this.suppliersTypes[0];
          
          this.getAll( this.currentPage, this.limit, this.typeSelected.id )
        },
    });

  }




  getAll( page: number, limit: number, typeId: number) {
    this.isLoading = true;
    this.suppliersService.getAll(page, limit, typeId)
      .subscribe({
        next: (resp: any) => {
          this.suppliers = resp.suppliers;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchCustomers( page: number, limit: number, typeId: number, queryString: string) {
    this.isLoading = true;
    this.suppliersService.search(page, limit, typeId, queryString)
      .subscribe({
        next: (resp: any) => {
          this.suppliers = resp.suppliers;
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

  async disableOrEnable( supplier: Supplier ) {

      const { isActive, id } = supplier;
  
      const { isConfirmed } = await Swal.fire({
        title: `¿Estás seguro?`,
        text: `¿Estás seguro que deseas ${ !isActive ? 'habilitar' : 'deshabilitar' } al proveedor?`,
        confirmButtonText: `¡Si, ${ !isActive ? 'habilitar' : 'deshabilitar' }!`,
        confirmButtonColor: '#43B02A',
        showCancelButton: true,
        cancelButtonText: '¡No, cancelar!',
        cancelButtonColor: '#f23e3e',
        allowOutsideClick: false
      })
  
      if ( !isConfirmed ) return;
  
      this.suppliersService.disableOrEnable( id )
        .subscribe({
          next: (resp: any) => {
            Swal.fire({
              icon: 'success',
              text: resp.message,
              allowEscapeKey: false,
              allowOutsideClick: false,
              timer: 2500,
              showConfirmButton: false
            })
            supplier.isActive = !isActive;
          },
          error: (error: any) => {
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
