import { AfterContentInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ProductsService } from '../../services/products.service';
import { BusinessLinesService } from '../../services/business-lines.service';
import { BusinessFamiliesService } from '../../services/business-families.service';
import { combineLatest, switchMap } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { BusinessFamily, BusinessLine, Product, ProductType } from '../../interfaces';
import Swal from 'sweetalert2';
import { StoresService } from '../../services/stores.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'add-product-store',
  templateUrl: './add-product-store.component.html',
  styleUrls: ['./add-product-store.component.scss']
})
export class AddProductStoreComponent {

  @Output() onAddSuccess =  new EventEmitter<boolean>(true);

  public storeId: number = 0;

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
                private activatedRoute: ActivatedRoute,
                private productsService: ProductsService,
                private businessLinesService: BusinessLinesService,
                private businessFamiliesService: BusinessFamiliesService,
                public modalService: ModalService,
                private storeService: StoresService ){}
 

  ngOnInit(): void {

    this.activatedRoute.params.subscribe( ({id}) => {
      console.log({id: +id});
      this.storeId = +id;
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
    this.productsService.getAll(
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      0,
      this.productTypeId,
      1
    )
      .subscribe({
        next: (resp: any) => {
          console.log(resp);
          this.products = resp.products.map( (product: Product) => {
            return {
              ...product,
              amount: 0
            }
          });
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
      0,
      this.productTypeId,
      1,
      this.querySearch
    )
      .subscribe({
        next: (resp: any) => {
          this.products = resp.products.map( (product: Product) => {
            return {
              ...product,
              amount: 0
            }
          });
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

  openModal() {
    this.modalService.openModal();
  }


  async addProductToStore( idx: number ) {

    const products = [{
      id: this.products[idx].id,
      amount: this.products[idx].amount,
    }]

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se agregará el producto ${this.products[idx].name} al almacén`,
      confirmButtonText: `¡Si, agregar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    this.storeService.addProductToStore( this.storeId, { products })
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
          this.products[idx].availableStock-=  this.products[idx].amount as number;
          this.products[idx].amount = 0;

          this.onAddSuccess.emit(true);
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

  closeModal() {
    this.modalService.closeModal();
  }

}
