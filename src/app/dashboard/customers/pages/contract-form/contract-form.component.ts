import { Component, OnInit } from '@angular/core';
import { ContractsService } from '../../services/contracts.service';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Budget } from '../../interfaces/budget.interface';
import { Product } from 'src/app/dashboard/catalogue/interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contract } from '../../interfaces/contract.interface';
import { BudgetsService } from '../../services/budgets.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Address } from '../../interfaces/address.interface';
import Swal from 'sweetalert2';
import { HtmlDescription } from '../../interfaces/html-description.interface';
import { HtmlDescriptionsGeneralService } from '../../services/html-descriptions-general.service';
import { combineLatest, lastValueFrom } from 'rxjs';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss']
})
export class ContractFormComponent implements OnInit {

  public contract!: Contract;

  public budgetSelected!: Budget;

  public addresses: MultiSelectData[] = [];
  public products: Product[] = [];
  
  public productsSelected: Product[] = [];
  public productSelected!: Product | null;
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    'createdById': ['', Validators.required ],
    'budgetId': ['', Validators.required ],
    'customerId': ['', Validators.required ],
    'paymentMethod': ['', Validators.required ],
    // 'typeWork': ['', Validators.required ],
    'htmlDescription': [''],
    // 'htmlGuarantee': [''],
    'expirationDate': ['', Validators.required ],
    'addressesIds': [[]]
  }); 

  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir',
  ];

  public editorConfig: AngularEditorConfig = {
    editable: true,
    height: '200px',
    sanitize: true,
  }

  public dropdownSettingsSingle = { 
    enableSearchFilter: true,
    singleSelection: false, 
    text:"Selecciona sede(s)",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
    selectAllText:'Seleccionar todas',
    unSelectAllText:'Quitar todas',
    filterSelectAllText: 'Seleccionar todos los resultados',
    filterUnSelectAllText: 'Quitar todos los resultados'
  }; 

  public showNotProducts: boolean = false;
  public showNotAdreess: boolean = false;

  public htmlDescriptions: HtmlDescription [] = [];
  public htmlDescSelected!: string | null;

  constructor( private fb: FormBuilder,
               private router: Router,
               public modalService: ModalService,
               private contractsService: ContractsService,
               private budgetsService: BudgetsService,
               private customerService: CustomersService,
               public authService: AuthService,
               private htmlDescriptionsService: HtmlDescriptionsGeneralService ) {}


  ngOnInit(): void {

    combineLatest([   
      this.htmlDescriptionsService.getAll(),
    ])
    .subscribe( combined => {
      this.htmlDescriptions = combined[0].htmlDescriptions;
    });
    

    if ( !this.router.url.includes('edit') ) { 

      this.contractsService.getBudgetId()
        .subscribe({
          next: ( budgetId ) => {
 
            
          

            if ( !budgetId ) window.history.back();;
            this.budgetsService.getById( budgetId! )
              .subscribe({
                next: async (resp) => {
                  this.budgetSelected = resp.budget;

                  const { 
                    createdById,
                    customerId,
                    paymentMethod,
                    // typeWork,
                    htmlDescription,
                    // htmlGuarantee,
                    budgetsProducts,
                    addresses,
                    id,
                  } = this.budgetSelected;

                  
                  let arrAddress = [];
                  
                  if ( addresses.length == 0 ) {
                    const resp = await lastValueFrom(this.customerService.getAllAddressByCustomerIdWithoutPagination( customerId ));
                    arrAddress = resp['addresses'];
                  } else {
                    arrAddress = addresses
                  }
                  
                  this.addresses = this.transformData(arrAddress);

                  this.productsSelected = budgetsProducts.map( bp => {
                    return {
                      ...bp.product,
                      amount: bp.amount,
                      priceSale: String(bp.unitPrice),
                      htmlDescription: bp.htmlDescription,
                      showDescription: bp.showDescription,
                      select: true,
                      addresses: []
                    }
                  })

                  this.form.setValue({
                    createdById,
                    budgetId: id,
                    customerId,
                    paymentMethod,
                    // typeWork,
                    htmlDescription,
                    // htmlGuarantee
                    expirationDate: '',
                    addressesIds: this.transformData([])
                  })


                }})
          }});
      return; 
    }else{
      this.isEdit = true;



    }

    this.isLoading = true;

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


  
  async handleSubmit() {
    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    if ( this.productsSelected.filter( ps => ps.select ).length == 0 ) return;

   
    if ( this.form.get('addressesIds')?.value.length == 0 ) {
      this.showNotAdreess = true;
      return;
    }

    this.showNotAdreess = false;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del contrato' : 'creará un nuevo contrato' } `,
      confirmButtonText: `¡Si, ${ this.isEdit ? 'actualizar' : 'crear' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    const data = {
      ...this.form.value,
      addressesIds: (this.form.get('addressesIds')?.value as MultiSelectData[]).map( address => {
        return address.id;
      }),
      products: this.productsSelected.filter( ps => ps.select ).map( ps => {
        return {
          id: ps.id,
          amount: Number(ps.amount),
          priceSale: Number(ps.priceSale),
          showDescription: ps.showDescription,
          htmlDescription: ps?.htmlDescription,
        }
      })
    }

    if ( this.isEdit ) {
      this.update( this.contract.id, data );
      return;
    }

    this.create( data );
  }


  async update( id: string, formData: any ) {
    this.contractsService.update( id, formData )
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
          this.router.navigateByUrl(`/customers/contracts/details/${resp.contract.id}`)
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


  async create( data: any ) {

    this.contractsService.create( data )
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
          this.router.navigateByUrl(`/customers/contracts/details/${resp.contract.id}`)
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


  onSelectProducts() {
    if (  this.productsSelected.filter( ps => ps.select ).length == 0 ) {
      this.showNotProducts = true;
      return;
    }
    this.showNotProducts = false;
  }

  newHtmlDescription( htmlDescription: any ) {
    this.productSelected!.htmlDescription = htmlDescription;
  }

  openHtmlDescriptionModal( productSelected: Product ) {
    this.productSelected = productSelected;
    this.modalService.openModal();
  }

  onChangeHtmlDesc() {
    if ( !this.htmlDescSelected ) {
      this.form.get('htmlDescription')?.setValue('')
      return;
    }
    this.form.get('htmlDescription')?.setValue( this.htmlDescSelected )
  }

  private transformData( addresses: Address[] ): MultiSelectData[] {
    return addresses.map( address => {
      return { id: address.id, itemName: `${address.name} | ${address.address}` }
    })
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

  getBaseGravable(): number {
    return this.productsSelected.reduce((sum, product) => {
      return sum + Number(product.amount!) * Number(product.priceSale!);
    }, 0);
  }
  
  getImpuesto(): number {
    return this.productsSelected.reduce((sum, product) => {
      return sum + (Number(product.amount!) * Number(product.priceSale!) * 0.16 );
    }, 0);
  }

}
