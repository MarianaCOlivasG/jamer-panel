import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentsService } from 'src/app/dashboard/purchases/services/payments.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { Balance } from '../../interfaces/balance.interface';
import { UploadsService } from 'src/app/shared/services/uploads.service';

@Component({
  selector: 'payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements OnInit {

  @Input() supplier!: { id: number, itemName: string };
  @Input() saldo: number = 0;
  @Input() bPurchase!: Balance;

  @Output() newPayment = new EventEmitter<null>();;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;


  public form: FormGroup = this.fb.group({
    'paymethod': ['', Validators.required ],
    'amount': ['', Validators.required ],
    'comment': [''],
    'bPurchaseId': ['', Validators.required ],
    'paymentAt': ['', Validators.required ],
  }); 
  

  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir',
  ];

  public file: File | null = null;

  public isValidSizeFile: boolean = true;

  constructor(  private paymentService: PaymentsService, 
                private modalService: ModalService, 
                private uploadsService: UploadsService, 
                private fb: FormBuilder ) { }


  ngOnInit(): void {
    this.form.get('bPurchaseId')?.setValue(this.bPurchase.id);
  }

  closeModal(){
    this.modalService.closeModal();
  }


  async create( ) {


    this.formSubmitted = true;

    if ( this.form.invalid ) return;


    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se añadira un pago al proveedor`,
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

      const resp = await this.paymentService.addPaymentsToSupplierId( this.supplier.id, { payment: this.form.value } ).toPromise();

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
        await this.uploadsService.uploadBPurchasePay( resp.payId, this.file ).toPromise();
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
      this.isSaving = false;
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

}
