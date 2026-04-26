import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ProductsService } from '../../services/products.service';
import { BusinessFamily, BusinessLine, Product, ProductType } from '../../interfaces';
import { SuppliersService } from 'src/app/dashboard/suppliers/services/suppliers.service';
import { BusinessLinesService } from '../../services/business-lines.service';
import { BusinessFamiliesService } from '../../services/business-families.service';
import { Supplier } from 'src/app/dashboard/suppliers/interfaces';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Router } from '@angular/router';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  public products: Product[] = [];

  public productTypes: ProductType[] = [];
  public productTypeId: number = 0; 

  public businessLines: BusinessLine[] = [];
  public businessLineId: number = 0;

  public businessFamilies: BusinessFamily[] = [];
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
                private businessLinesService: BusinessLinesService,
                private businessFamiliesService: BusinessFamiliesService,
                private localStorageService: LocalStorageService,
                private router: Router,
                ){}
                public create: any;
                public edit:any;
                public deleted:any;
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
    combineLatest([   
      this.productsService.getTypes(),
      this.businessLinesService.getAllWithoutPagination(),
      this.businessFamiliesService.getAllWithoutPagination( this.businessLineId ),
      this.suppliersService.  getWithoutPagination()
    ])
    .subscribe( combined => {
      this.productTypes = combined[0].productTypes;
      this.businessLines = combined[1].businessLines;
      this.businessFamilies = combined[2].businessFamilies;
      this.suppliers = combined[3].suppliers;

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
      case 'businessLineId':
        if ( this.businessLineId == 0 ) {
          this.businessFamilies = [];
          this.getProducts();
          return;
        } 
        this.businessFamiliesService.getAllWithoutPagination(this.businessLineId)
          .subscribe({
            next: (resp) => {
              this.businessFamilies = resp.businessFamilies;
              this.getProducts();
            }
          })
        break;  
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
