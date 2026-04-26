import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BusinessFamily, BusinessLine, Product, ProductType } from 'src/app/dashboard/catalogue/interfaces';
import { BusinessFamiliesService } from 'src/app/dashboard/catalogue/services/business-families.service';
import { BusinessLinesService } from 'src/app/dashboard/catalogue/services/business-lines.service';
import { ProductsService } from 'src/app/dashboard/catalogue/services/products.service';
import { StoresService } from 'src/app/dashboard/catalogue/services/stores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent {


  public products: Product[] = [];

  public productTypes: ProductType[] = [];
  public productTypeId: number = 0; 

  public businessLines: BusinessLine[] = [];
  public businessLineId: number = 0;

  public businessFamilies: BusinessFamily[] = [];
  public businessFamilyId: number = 0;

  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public isSaving: boolean = false;


  constructor(  public authService: AuthService,
                private productsService: ProductsService,
                private businessLinesService: BusinessLinesService,
                private businessFamiliesService: BusinessFamiliesService,
                public storesService: StoresService ){}

  ngOnInit(): void {

    combineLatest([   
      this.productsService.getTypes(),
      this.businessLinesService.getAllWithoutPagination(),
      this.businessFamiliesService.getAllWithoutPagination( this.businessLineId ),
    ])
    .subscribe( combined => {
      this.productTypes = combined[0].productTypes;
      this.businessLines = combined[1].businessLines;
      this.businessFamilies = combined[2].businessFamilies;

      this.getProducts();
    });

  }

  
  getProducts() {
    this.isLoading = true;
    this.productsService.getAllInStok(
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      this.productTypeId,
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
    this.productsService.searchInStock(
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      this.productTypeId,
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


  onAddSuccess() {
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getProducts()
  }



}
