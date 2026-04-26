import { Component, Input } from '@angular/core';
import { BusinessFamily, Product, ProductType } from '../../../interfaces';
import { Supplier } from 'src/app/dashboard/suppliers/interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ProductsService } from '../../../services/products.service';
import { combineLatest } from 'rxjs';
import { SuppliersService } from 'src/app/dashboard/suppliers/services/suppliers.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'products-list',
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent {

  @Input() businessFamily!: BusinessFamily;

  public products: Product[] = [];

  public productTypes: ProductType[] = [];
  public productTypeId: number = 0; 

  public businessLineId: number =  0;
  public businessFamilyId: number = 0;
  
  public suppliers: Supplier[] = [];
  public supplierId: number = 0;

  public status: number = 1;

  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public isSaving: boolean = false;


  constructor(  public authService: AuthService,
                private productsService: ProductsService,
                private suppliersService: SuppliersService,
                private localStorageService: LocalStorageService,
                private router: Router,
              ){}
              public create:any;
              public edited:any;
              public deleted:any;
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "business line")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edited =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
    this.businessFamilyId = this.businessFamily.id;
    this.businessLineId = this.businessFamily.businessLineId;

    combineLatest([   
      this.productsService.getTypes(),
      this.suppliersService.  getWithoutPagination()
    ])
    .subscribe( combined => {
      this.productTypes = combined[0].productTypes;
      this.suppliers = combined[1].suppliers;

      this.getProducts();
    });

  }

  
  getProducts() {
    this.isLoading = true;
    this.productsService.getAll(
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      this.supplierId,
      this.productTypeId,
      this.status
    )
      .subscribe({
        next: (resp: any) => {
          this.products = resp.products;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchProducts() {
    this.isLoading = true;
    this.productsService.search(
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      this.supplierId,
      this.productTypeId,
      this.status,
      this.querySearch
    )
      .subscribe({
        next: (resp: any) => {
          this.products = resp.products;
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
      this.getProducts();
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchProducts()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getProducts();
      } else {
        this.searchProducts();
      }
  }


  changeModel( formName: string ) {
    this.currentPage = 1;
    this.isSuggestions = false;
    switch ( formName ) {
      default:
        this.getProducts();
        break;
    }
  }

  async disableOrEnable( product: any ) {
     const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${  product.isActive ? 'deshabilitará' : 'habilitará' } el producto.`,
      confirmButtonText: `¡Si, ${ product.isActive ? 'deshabilitar' : 'activar' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;
    this.productsService.disableOrEnable( product.id )
      .subscribe({
        next: (resp:any) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.getProducts();
          this.isSaving = false;
        },
        error:(err) => {
          Swal.fire({
            text: err.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
        }
      })

  }

}
