import { Component, OnInit } from '@angular/core';
import { BusinessFamily, BusinessLine, Product, ProductType } from '../../interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ProductsService } from '../../services/products.service';
import { BusinessLinesService } from '../../services/business-lines.service';
import { BusinessFamiliesService } from '../../services/business-families.service';
import { combineLatest, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { StoresService } from '../../services/stores.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'products-store-list',
  styleUrls:[
  './products-store-list.component.css'],
  templateUrl: './products-store-list.component.html',
})
export class ProductsStoreListComponent implements OnInit {

  public storeId: number = 0; 
  public isGeneralStore: boolean = false;
  
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


  constructor(  private activatedRoute: ActivatedRoute,
                public authService: AuthService,
                private productsService: ProductsService,
                private businessLinesService: BusinessLinesService,
                private businessFamiliesService: BusinessFamiliesService,
                public modalService: ModalService,
                public storesService: StoresService,
                private localStorageService: LocalStorageService,
                ){}

                public edit:any;
                public create:any;
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 

     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 

    this.activatedRoute.params.subscribe( ({id}) => {
      this.storeId = id;
      this.isGeneralStore = id == 1;
    });

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
    
    // Selecciona el endpoint correcto según el tipo de almacén
    const request = this.isGeneralStore 
      ? this.productsService.getAllInStok(
          this.currentPage, 
          this.limit, 
          this.businessLineId, 
          this.businessFamilyId,
          this.productTypeId
        )
      : this.productsService.getAllByStoreId(
          this.storeId,
          this.currentPage, 
          this.limit, 
          this.businessLineId, 
          this.businessFamilyId,
          this.productTypeId
        );
    
    request.subscribe({
      next: (resp: any) => {
        console.log(resp)
        this.products = resp.products;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoading = false;
        Swal.fire({
          text: 'Error al cargar los productos',
          icon: 'error',
          timer: 2500,
          showConfirmButton: false
        });
      }
    });
  }

  searchProducts() {
    this.isLoading = true;
    
    // Selecciona el endpoint de búsqueda correcto según el tipo de almacén
    const request = this.isGeneralStore
      ? this.productsService.searchInStock(
          this.currentPage, 
          this.limit, 
          this.businessLineId, 
          this.businessFamilyId,
          this.productTypeId,
          this.querySearch
        )
      : this.productsService.searchByStoreId(
          this.storeId,
          this.currentPage, 
          this.limit, 
          this.businessLineId, 
          this.businessFamilyId,
          this.productTypeId,
          this.querySearch
        );
    
    request.subscribe({
      next: (resp: any) => {
        this.products = resp.products;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en la búsqueda de productos:', err);
        this.isLoading = false;
        Swal.fire({
          text: 'Error al buscar productos',
          icon: 'error',
          timer: 2500,
          showConfirmButton: false
        });
      }
    });
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
    this.searchProducts();
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

  openModal() {
    this.modalService.openModal();
  }

  onAddSuccess() {
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getProducts()
  }

  
  async assingProductSpent( productStoreId: number ) {
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se marcará el producto del empleado como agotado.`,
      confirmButtonText: `¡Si, remover!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    this.storesService.assingProductSpent( productStoreId )
      .subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
          this.onAddSuccess();
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
          this.isSaving = false;
        }
      })
  }

  async removeProductToStore( productStoreId: number ) {
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Eliminará el producto de el almacén`,
      confirmButtonText: `¡Si, remover!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    this.storesService.removeProductToStore( productStoreId )
      .subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
          this.onAddSuccess();
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
          this.isSaving = false;
        }
      })
  }

  updateAmout( productId: number, amount: number, productStoreId: string ) {
    this.isSaving = true;
    this.storesService.updateAmountProducts(this.storeId, { productId, amount, productStoreId })
      .subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
        },
        error: (error) => {
          console.log(error);
          Swal.fire({
            text: error.error.message,
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