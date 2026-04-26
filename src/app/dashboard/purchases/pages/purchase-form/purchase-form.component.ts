import { Component, ViewChild } from '@angular/core';
import { Supplier } from 'src/app/dashboard/suppliers/interfaces';
import { Product } from 'src/app/dashboard/catalogue/interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { SuppliersService } from 'src/app/dashboard/suppliers/services/suppliers.service';
import { ProductsService } from 'src/app/dashboard/catalogue/services/products.service';
import { combineLatest } from 'rxjs';
import Swal from 'sweetalert2';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { InputSearchComponent } from 'src/app/shared/components/input-search/input-search.component';
import { PurchaseOrder } from 'src/app/dashboard/purchase-orders/interfaces/purchase-order.interface';
import { PurchaseOrdersService } from 'src/app/dashboard/purchase-orders/services/purchase-orders.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Purchase } from '../../interfaces/purchase.interface';
import { PurchasesService } from '../../services/purchases.service';
import { Payment } from '../../interfaces/payment.interface';
import * as moment from 'moment-timezone';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss']
})
export class PurchaseFormComponent {

  public purcharse!: Purchase;

  public suppliers: MultiSelectData[] = [];
  public products: Product[] = [];

  public productsSelected: Product[] = [];
  public purchaseOrderSelected!: PurchaseOrder | null;
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;


  public form: FormGroup = this.fb.group({
    'createdById': ['', Validators.required ],
    'supplierId': [[], Validators.required ],
    'observations': [''],
    'currency': ['MXN', Validators.required ],
    'expirationDate': ['', Validators.required ],
    'refSupplier': ['', Validators.required ],
    // 'paymentMethod': ['PUE', Validators.required ],
  }); 

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 5;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public isLoadingProducts: boolean = false;

  public dropdownSettings = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Seleccionar proveedor",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  };

  @ViewChild(InputSearchComponent) inputSearchComponent!: InputSearchComponent;


  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir',
  ];

  public payments: Payment[] = [{
    amount: 0,
    concept: 'Efectivo',
  }];

  public totals: Totals = {
    subTotal: 0,
    discount: 0,
    subTotalWithDiscount: 0,
    ieps: 0,
    iepsPorcent: 0,
    iva: 0,
    withIva: false,
    totalWithIva: 0,
  }

  public balance: number = 0;

  constructor( private fb: FormBuilder,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              public authService: AuthService,
              private suppliersService: SuppliersService,
              private productsService: ProductsService,
              private purchaseOrdersService: PurchaseOrdersService,
              private purchaseService: PurchasesService,
              public modalService: ModalService,
              private location: Location,
              private localStorageService: LocalStorageService,
              ){}

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "kardex")?.permissions );
    ((permissions as number >> 1 ) % 2 == 1 || ((permissions as number >> 2 ) % 2 == 1))? true :  this.router.navigate(['/calendar/my-calendar']);

    this.form.get('createdById')?.setValue(this.authService.user.id)

    combineLatest([   
      this.suppliersService.getWithoutPagination(),
    ])
    .subscribe( combined => {
      this.suppliers = this.transformData(combined[0].suppliers);
    });
    
    if ( !this.router.url.includes('edit') ) { return; }

  }


  async handleSubmit() {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    if ( this.productsSelected.length == 0 ) return;

   

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información de la compra' : 'creará una nueva compra' } `,
      confirmButtonText: `¡Si, ${ this.isEdit ? 'actualizar' : 'crear' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    const ex = moment(this.form.get('expirationDate')?.value).tz('America/Cancun');
    const today = moment(moment(Date.now()).format('YYYY-MM-DD'));

    const data = {
      ...this.form.value,
      supplierId: (this.form.get('supplierId')?.value as MultiSelectData[])[0]['id'],
      products: this.productsSelected.map( ps => {
        return {
          id: ps.id,
          amount: ps.amount,
          unit: ps.unit,
          cost: Number(ps.cost)
        }
      }),
      subTotal: this.totals['subTotal'],
      discount: this.totals['discount'],
      subTotalWithDiscount: this.totals['subTotalWithDiscount'],
      ieps: this.totals['ieps'],
      iepsPorcent: this.totals['iepsPorcent'],
      iva: this.totals['iva'],
      withIva: this.totals['withIva'],
      totalWithIva: this.totals['totalWithIva'],
      payments: this.payments.filter( p => Number(p.amount) > 0),
      status: ( this.balance == 0 && !ex.isSameOrAfter(today)) ? 'late-payment' : 
              ( this.balance == 0 && ex.isSameOrAfter(today)) ? 'paid' : 
              ( this.balance > 0 && ex.isSameOrAfter(today) ) ? 'pending' : 
              ( this.balance > 0 && !ex.isSameOrAfter(today) ) ? 'not-paid' : 
              ( this.balance < 0 && ex.isSameOrAfter(today) ) ? 'surplus': 
              ( this.balance < 0 && !ex.isSameOrAfter(today) ) ? 'late-payment' :
              ( this.balance == 0 ) ? 'paid' :
              ( this.balance > 0 ) ? 'pending' :
              ( this.balance < 0 ) ? 'surplus' : ''
    }

   

    if ( this.isEdit ) {
      // this.update( this.budget.id, data );
      return;
    }

    this.create( data );

  }




  async create( data: any ) {

    this.purchaseService.create( data )
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
          this.router.navigateByUrl(`/purchases/details/${resp.purchase.id}`)
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
  


  inputInvalid( campo: string ): boolean {
    if ( this.form.get(campo)?.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }
  }

  errorMessage( campo: string ): string {
    return this.form.get(campo)?.hasError('required') ? `Este campo es requerido.` :
        this.form.get(campo)?.hasError('email') ? `Correo electrónico inválido.` :
        this.form.get(campo)?.hasError('minlength') ? `Mínimo ${this.form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.` :
        this.form.get(campo)?.hasError('maxlength') ? `Máximo ${this.form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.` : '';
  }




  searchProducts() {
    this.isLoadingProducts = true;
    this.productsService.searchAutoComplete(
      this.currentPage, 
      this.limit, 
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
          this.isLoadingProducts = false;
        },
    })
  }


  search( query:string ):void {

    this.currentPage = 1;

    if ( query.length == 0 ) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.products = [];
      this.totalResults = 0;
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
        // this.getProducts();
        this.products = [];
        this.totalResults = 0;
      } else {
        this.searchProducts();
      }
  }

  addProductToList( idx: number ) {

    // Verificar si ya existe el producto en el arreglo
    const exist = this.productsSelected.find( ps => ps.id == this.products[idx].id);

    if ( exist ) {
      exist.amount = exist.amount! + this.products[idx].amount!
      exist.totalInputView = exist.totalInputView + (Number(this.products[idx].amount) * Number(this.products[idx].cost));
      this.totals.subTotalWithDiscount = exist.totalInputView;
    } else {
      this.products[idx].totalInputView = (Number(this.products[idx].amount) * Number(this.products[idx].cost));
      this.productsSelected.push({...this.products[idx]});
      this.totals.subTotalWithDiscount = this.products[idx].totalInputView ;

    }

    this.calculateTotals();
    this.changePaymentAmount();

    this.isSuggestions = false;
    this.querySearch = '';
    this.products = [];
    this.totalResults = 0;
    this.inputSearchComponent.resetValueInput();

  }


  removeProductToList( idx: number ) {
    this.productsSelected.splice(idx, 1);
    this.calculateTotals();
    this.changePaymentAmount();
  }



  onItemSelect(item:any){
    console.log(item);
  }
  OnItemDeSelect(item:any){
      console.log(item);
  }
  onSelectAll(items: any){
      console.log(items);
  }
  onDeSelectAll(items: any){
      console.log(items);
  }
  
  private transformData( suppliers: Supplier[] ): MultiSelectData[] {
    return suppliers.map( supplier => {
      return { id: supplier.id, itemName: `${supplier.name} | ${supplier.rfc}` }
    })
  }


  onChange( idx: number ) {
    this.productsSelected[idx].totalInputView = (Number(this.productsSelected[idx].amount) * Number(this.productsSelected[idx].cost));
    this.calculateTotals();
    this.changePaymentAmount();
  }

  calculateTotals() {
    this.totals.subTotal = this.productsSelected.reduce((sum, product) => (typeof product.totalInputView == "number" ? sum + product.totalInputView : sum), 0);

    if( this.totals.discount! > 0 ){
      this.totals.subTotalWithDiscount = Number(this.totals.discount) != 0 ? this.totals.subTotal - ((Number(this.totals.discount) / 100) * this.totals.subTotal) : this.totals.subTotal; 
    } else {
      this.totals.subTotalWithDiscount = this.totals.subTotal;
    }

    if ( Number(this.totals.iepsPorcent) > 0 ){
      this.totals.ieps = this.totals.subTotalWithDiscount * ( Number(this.totals.iepsPorcent) / 100 );
    } if ( Number(this.totals.iepsPorcent) == 0 ) {
      this.totals.ieps = 0;
    }

    if( !this.totals.withIva ) {
      this.totals.iva = 0;
    }

    if ( Number(this.totals.ieps) > 0 && this.totals.withIva ) {
      this.totals.iva = (this.totals.subTotalWithDiscount! + Number(this.totals.ieps) ) * (16 / 100);
    } else if ( Number(this.totals.ieps) == 0 && this.totals.withIva  ) {
      this.totals.iva = this.totals.subTotalWithDiscount! * (16 / 100);
    } 

    this.totals.totalWithIva = this.totals.subTotalWithDiscount + this.totals.ieps! + this.totals.iva!;

  }

  onDiscountChange() {
    this.calculateTotals();
    this.changePaymentAmount();
  }

  openModal() {
    this.modalService.openModal();
  }


  newPurchaseOrderSelected( purchaseOrder: PurchaseOrder ) {
    this.purchaseOrdersService.getById( Number(purchaseOrder.id ))
      .subscribe({
        next: (resp) => {
          this.purchaseOrderSelected = resp.purchaseOrder;

          const { supplier, productsPurchaseOrder } = this.purchaseOrderSelected!;

          this.form.get('supplierId')?.setValue([{ id: supplier.id, itemName: `${supplier.rfc} | ${supplier.name}` }])

          const results = productsPurchaseOrder.map( p => {
            return {
              ...p,
              ...p.product,
              amount: Number(p.amount),
              cost: Number(p.cost),
              totalWithIva: Number(p.totalWithIva),
              totalWithoutIva: Number(p.totalWithoutIva),
              totalInputView: (Number(p.amount) * Number(p.cost))
            }
          })

          this.productsSelected = (results as any);
          this.totals = {
            subTotal: Number(this.purchaseOrderSelected?.subTotal),
            discount: Number(this.purchaseOrderSelected?.discount),
            subTotalWithDiscount: Number(this.purchaseOrderSelected?.subTotalWithDiscount),
            ieps: Number(this.purchaseOrderSelected?.ieps),
            iepsPorcent: Number(this.purchaseOrderSelected?.iepsPorcent),
            iva: Number(this.purchaseOrderSelected?.iva),
            withIva: Number(this.purchaseOrderSelected?.withIva) == 1 ? true : false,
            totalWithIva: Number(this.purchaseOrderSelected?.totalWithIva)
          }

          this.calculateTotals();
          this.changePaymentAmount();

        }
      })
  }

  resetPurchaseOrder() {
    this.purchaseOrderSelected = null;
    this.productsSelected = [];
    this.totals = {
      subTotal: 0,
      discount: 0,
      subTotalWithDiscount: 0,
      ieps: 0,
      iva: 0,
      totalWithIva: 0,
    };
  }

  changePaymentAmount() {
    const sum = this.payments.reduce((previous, current) => {
      return previous + Number(current.amount);
    }, 0);
    
    this.balance = this.totals.totalWithIva! - sum;
  }


  addPayment() {

    const exist0 = this.payments.find( p => Number(p.amount) == 0 );

    if ( exist0 ) return;

    this.payments.push({
      concept: 'Efectivo',
      amount: 0
    });
  }


  removePayment( idx: number ) {
    this.payments.splice(idx, 1);
    this.calculateTotals();
    this.changePaymentAmount();
  }


  onChangePayMethod() {
    if ( this.form.get('paymentMethod')?.value == 'PUE' ) {
      this.payments = this.payments.slice(0,1);
      this.calculateTotals();
      this.changePaymentAmount();
      return;
    }
  }


  onIepsPorcentChange() {
    this.calculateTotals()
  }

  onIvaChange() {
    this.calculateTotals()
  }

  goToBack() {
    this.location.back()
  }


}


interface Totals {
  subTotal?: number;
  discount?: number;
  subTotalWithDiscount?: number;
  ieps?: number;
  iva?: number;
  totalWithIva?: number;
  iepsPorcent?: number;
  withIva?: boolean;
}
