import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../interfaces';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { CustomersPaymentsService } from '../../services/payments.service';
import { UploadsService } from 'src/app/shared/services/uploads.service';

@Component({
  selector: 'cobranza-sale-modal',
  templateUrl: './cobranza-sale-modal.component.html',
  styleUrls: ['./cobranza-sale-modal.component.scss']
})
export class CobranzaSaleModalComponent implements OnInit {

  @Input() saleFolio!: string;
  @Input() saldo: number = 0;
  @Input() bSale!: any;

  @Output() newPayment = new EventEmitter<null>();;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'paymethod': ['', Validators.required ],
    'amount': ['', Validators.required ],
    'paymentAt': ['', Validators.required ],
    'destinationAccount': ['', Validators.required ],
    'bSaleId': [''],
    'complement': [''],
  }); 

  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir',
  ];

  public dropdownSettingsSingle = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Selecciona una opción",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  }; 

  public customers: MultiSelectData[] = [];

  public services: any[] = [];

  public file: File | null = null;

  public isValidSizeFile: boolean = true;

  constructor(  private customersService: CustomersService,
                private customersPaymentsService: CustomersPaymentsService, 
                private modalService: ModalService, 
                private fb: FormBuilder,
                private workOrderService: WorkOrdersService,
                private uploadsService: UploadsService ) { }


  ngOnInit(): void {


    this.form.get('bSaleId')?.setValue( this.bSale.id );
    
    this.customersService.getAllWithoutPagination()
        .subscribe( resp => {
          this.customers = this.transformCustomers( resp.customers );
        })

  }

  private transformCustomers( customers: Customer[] ): MultiSelectData[] {
    return customers.map( customer => {
      return { id: customer.id, itemName: customer.name + ' | ' + customer.rfc }
    })
  }

  closeModal(){
    this.modalService.closeModal();
  }


  async create( ) {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se añadirá un registro en la cobranza`,
      confirmButtonText: `¡Si, añadir!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

   
    try {
      const resp = await this.customersPaymentsService.addPaymentSale( { payment: this.form.value } ).toPromise();

      if ( !resp.status ) {
        Swal.fire({
          text: resp.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
        return;
      }

      if ( this.file ) {
        await this.uploadsService.uploadCobranzaSale( resp.payId, this.file ).toPromise();
      }

      Swal.fire({
        text: resp.message,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      })
      
      this.newPayment.emit();
      this.modalService.closeModal();
    } catch (error: any) {
      Swal.fire({
        text: error.message,
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
    }

   
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


  getWorkOrdersByCustomerId( customerId: number  ) {
    this.workOrderService.getWorkOrdersByCustomerId( customerId, 'R' )
      .subscribe( resp => {
        this.services = resp['workOrders'];
      })
  }

  onItemSelect(item:any){
  }
  OnItemDeSelect(item:any){
  }
  onSelectAll(items: any){
  }
  onDeSelectAll(items: any){
  }


  changeFile(  target: EventTarget | null ) {

    if ( (target as HTMLInputElement).files!.length == 0 ) {
      this.file = null;
      return;
    }

    this.file = (target as HTMLInputElement).files![0];

    this.validateFile( this.file );
    console.log('Ready to upload!')
  }


  
  validateFile( file: File ): boolean{

    if ( file.size > 4 * 1024 * 1024 ) {
      this.isValidSizeFile = false;
      this.file = null;
      return false;
    }

    this.isValidSizeFile = true;
    return true;
  }


  onChange( formName: string ) {

    switch (formName) {
    

      case 'customerId':

        if ( (this.form.get('customerId')?.value as any[]).length == 0 ) {
          this.services = [];
          return;
        };

        this.getWorkOrdersByCustomerId( this.form.get('customerId')?.value[0].id );

        break;
    
      default:
        break;
    }

  }

}
