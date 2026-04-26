import { Component, OnInit } from '@angular/core';
import { BusinessFamily, BusinessLine, Product, ProductType } from '../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../../services/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { combineLatest, switchMap } from 'rxjs';
import { SuppliersService } from 'src/app/dashboard/suppliers/services/suppliers.service';
import { BusinessLinesService } from '../../../services/business-lines.service';
import { BusinessFamiliesService } from '../../../services/business-families.service';
import { Supplier } from 'src/app/dashboard/suppliers/interfaces';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  public product!: Product;
  public productTypes: ProductType[] = [];
  public businessLines: BusinessLine[] = [];
  public businessFamilies: BusinessFamily[] = [];
  public suppliers: Supplier[] = []; 
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    'name': ['', Validators.required],
    'healthRegister': ['', Validators.required],
    // 'supplierId': ['', Validators.required],
    'productTypeId': ['', Validators.required],
    'businessLineId': ['', Validators.required],
    'businessFamilyId': ['', Validators.required],
    'minStock': ['', Validators.required],
    'unitOut': ['', Validators.required],
    'description': [''],
    'onSale': [false, Validators.required],
    'cost': ['', Validators.required],
    'unit': ['', Validators.required],
    'priceSale': [0],
    'ieps': [0],
    'iva': [0],
    'withIva': [true],
    'iepsPorcent': [''],
  });


  public withIva: boolean = true;


  public desgloseIEPS: number = 0;
  public desgloseIVA: number = 0;


  public totals: Totals = {
    ieps: 0,
    iva: 0,
    total: 0
  }

  constructor( private fb: FormBuilder,
               private activatedRoute: ActivatedRoute,
               private router: Router,
               private productsService: ProductsService,
              private suppliersService: SuppliersService,
              private businessLinesService: BusinessLinesService,
              private businessFamiliesService: BusinessFamiliesService,
              private location: Location,
              private localStorageService: LocalStorageService,
  ){}

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    ( ((permissions as number >> 2 ) % 2 == 1) || ((permissions as number >> 1 ) % 2 == 1))? true :  this.router.navigate(['/calendar/my-calendar']);

    combineLatest([   
      this.productsService.getTypes(),
      this.businessLinesService.getAllWithoutPagination(),
      this.businessFamiliesService.getAllWithoutPagination(0),
      this.suppliersService.  getWithoutPagination()
    ])
    .subscribe( combined => {
      this.productTypes = combined[0].productTypes;
      this.businessLines = combined[1].businessLines;
      this.businessFamilies = combined[2].businessFamilies;
      this.suppliers = combined[3].suppliers;
    });
    
    if ( !this.router.url.includes('edit') ) { return; }

    this.isEdit = true;
    this.isLoading = true;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.productsService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.product = resp.product;
        this.getFamiliesByLine( this.product.businessLineId );

        if ( this.product.productTypeId == 2 ) {
          this.validatorsFormUpdateService();
        }


        const { 
          name,
          healthRegister,
          // supplierId,
          productTypeId,
          businessLineId,
          businessFamilyId,
          description,
          onSale,
          cost,
          unit,
          minStock,
          unitOut,
          priceSale,
          ieps,
          iva,
          iepsPorcent,
          total
        } = this.product;

        this.form.setValue({
          name,
          healthRegister,
          // supplierId,
          productTypeId,
          businessLineId,
          businessFamilyId,
          description,
          onSale,
          priceSale,
          cost,
          ieps,
          iva,
          withIva: iva && Number(iva) > 0,
          unit,
          minStock,
          unitOut,
          iepsPorcent
         });

         this.totals = {
          ieps: Number(ieps),
          iva: Number(iva),
          total: Number(total) 
         }

        this.isLoading = false;
      });

  }


  getFamiliesByLine( businessLineId: number ) {
    this.businessFamiliesService.getAllWithoutPagination(businessLineId)
      .subscribe({
        next: (resp) => {
          this.businessFamilies = resp.businessFamilies;
        }
      })
  }


  async handleSubmit() {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del producto' : 'creará un nuevo producto' } `,
      confirmButtonText: `¡Si, ${ this.isEdit ? 'actualizar' : 'crear' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    if ( this.form.get('productTypeId')?.value == 2 ) {
      this.form.get('minStock')?.setValue(0);
      this.form.get('unitOut')?.setValue('');
    }

    const data = {
      ...this.form.value,
      total: this.totals['total'],
      iva: this.totals['iva'],
      ieps: this.totals['ieps'],
    }

    if ( this.isEdit ) {
      this.update( this.product.id, data );
      return;
    }

    this.create( data );

  }

  create( formData: any ) {

    this.productsService.create( formData )
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
          this.router.navigate(['catalogue', 'products','edit', resp.product.id])
        },
        error: (error: any) => {
          console.log(error)
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
      });
  }


  update( id: number, formData: any ) {
    this.productsService.update( id, formData )
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
        error: (error: any) => {
          console.log(error)
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
      });
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


  validatorsFormUpdateService() {
    this.form.get('healthRegister')?.setValue('');
    this.form.get('healthRegister')?.setValidators([]);
    this.form.get('healthRegister')?.updateValueAndValidity();

    this.form.get('cost')?.setValue('');
    this.form.get('cost')?.setValidators([]);
    this.form.get('cost')?.updateValueAndValidity();

    this.form.get('unit')?.setValue('');
    this.form.get('unit')?.setValidators([]);
    this.form.get('unit')?.updateValueAndValidity();

    this.form.get('minStock')?.setValue('');
    this.form.get('minStock')?.setValidators([]);
    this.form.get('minStock')?.updateValueAndValidity();

    this.form.get('unitOut')?.setValue('');
    this.form.get('unitOut')?.setValidators([]);
    this.form.get('unitOut')?.updateValueAndValidity();
  }



  onChange( formName: string ) {

    switch ( formName ) {
      case 'businessLineId':
        if ( this.form.get('businessLineId')?.value == 0 ) {
          this.businessFamilies = [];
          this.form.get('businessFamilyId')?.setValue('');
          return;
        } 
        this.getFamiliesByLine( this.form.get('businessLineId')?.value );
        this.form.get('businessFamilyId')?.setValue('');
        return;  
      
      case 'onSale':
          if ( !this.form.get('onSale')?.value ) {
            this.form.get('priceSale')?.setValue(0);
            this.form.get('priceSale')?.setValidators([]);
            this.form.get('priceSale')?.updateValueAndValidity();

            this.form.get('iepsPorcent')?.setValue(0);
            this.form.get('iepsPorcent')?.setValidators([]);
            this.form.get('iepsPorcent')?.updateValueAndValidity();

            this.form.get('iva')?.setValue(0);
            this.form.get('iva')?.setValidators([]);
            this.form.get('iva')?.updateValueAndValidity();

            return;
          } 

          this.form.get('priceSale')?.setValue(0);
          this.form.get('priceSale')?.setValidators([Validators.required]);
          this.form.get('priceSale')?.updateValueAndValidity();

          this.form.get('iepsPorcent')?.setValue(0);
          this.form.get('iepsPorcent')?.setValidators([Validators.required]);
          this.form.get('iepsPorcent')?.updateValueAndValidity();

          this.form.get('iva')?.setValue(0);
          this.form.get('iva')?.setValidators([Validators.required]);
          this.form.get('iva')?.updateValueAndValidity();


          return;
          
      case 'productTypeId':

        if ( this.form.get('productTypeId')?.value == 2 ){

          this.form.get('healthRegister')?.setValue('');
          this.form.get('healthRegister')?.setValidators([]);
          this.form.get('healthRegister')?.updateValueAndValidity();

          // this.form.get('supplierId')?.setValue(null);
          // this.form.get('supplierId')?.setValidators([]);
          // this.form.get('supplierId')?.updateValueAndValidity();

          this.form.get('cost')?.setValue('');
          this.form.get('cost')?.setValidators([]);
          this.form.get('cost')?.updateValueAndValidity();

          this.form.get('unit')?.setValue('');
          this.form.get('unit')?.setValidators([]);
          this.form.get('unit')?.updateValueAndValidity();

          this.form.get('minStock')?.setValue('');
          this.form.get('minStock')?.setValidators([]);
          this.form.get('minStock')?.updateValueAndValidity();

          this.form.get('unitOut')?.setValue('');
          this.form.get('unitOut')?.setValidators([]);
          this.form.get('unitOut')?.updateValueAndValidity();
          
          return;
        }

        this.form.get('healthRegister')?.setValue('');
        this.form.get('healthRegister')?.setValidators([Validators.required]);
        this.form.get('healthRegister')?.updateValueAndValidity();

        // this.form.get('supplierId')?.setValue('');
        // this.form.get('supplierId')?.setValidators([Validators.required]);
        // this.form.get('supplierId')?.updateValueAndValidity();

        this.form.get('cost')?.setValue('');
        this.form.get('cost')?.setValidators([Validators.required]);
        this.form.get('cost')?.updateValueAndValidity();

        this.form.get('unit')?.setValue('');
        this.form.get('unit')?.setValidators([Validators.required]);
        this.form.get('unit')?.updateValueAndValidity();

        this.form.get('minStock')?.setValue('');
        this.form.get('minStock')?.setValidators([Validators.required]);
        this.form.get('minStock')?.updateValueAndValidity();


        this.form.get('unitOut')?.setValue('');
        this.form.get('unitOut')?.setValidators([Validators.required]);
        this.form.get('unitOut')?.updateValueAndValidity();
        return;

      case 'priceSale':
        this.calculateTotals();
        return;

      case 'iepsPorcent':
        this.calculateTotals();
        return;

      case 'withIva':
        this.calculateTotals();
        return;

      default:
        return;
    }

  }

  calculateTotals() {

    if ( this.form.get('iepsPorcent')?.value && Number(this.form.get('iepsPorcent')?.value) > 0 ){
      this.totals.ieps = Number(this.form.get('priceSale')?.value ) * ( Number(this.form.get('iepsPorcent')?.value) / 100 );
    } else {
      this.totals.ieps = 0;
    }

    if( !this.form.get('withIva')?.value ) {
      this.totals.iva = 0;
    }

    if ( Number(this.totals.ieps) > 0 && this.form.get('withIva')?.value  ) {
      this.totals.iva = (Number(this.form.get('priceSale')?.value)! + Number(this.totals.ieps) ) * 0.16;
    } else if ( Number(this.totals.ieps) == 0 && this.form.get('withIva')?.value   ) {
      this.totals.iva = Number(this.form.get('priceSale')?.value)! * (16 / 100);
    } 

    this.totals.total = Number(this.form.get('priceSale')?.value) + this.totals.ieps! + this.totals.iva!;

  }
            
  goToBack() {
    this.location.back();
  }

}


interface Totals {
  ieps: number
  iva: number
  total: number
}