import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BalanceCustomer } from 'src/app/dashboard/suppliers/interfaces/balance-customers.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { Customer } from '../../interfaces';
import { CustomersPaymentsService } from '../../services/payments.service';

@Component({
  selector: 'payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements OnInit {

  @Input() customer!: Customer;
  @Input() bWorkOrder!: BalanceCustomer;

  @Output() newPayment = new EventEmitter<null>();;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'paymethod': ['', Validators.required ],
    'amount': ['', Validators.required ],
    'comment': [''],
    'bWorkOrderId': ['', Validators.required ],
  }); 

  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir',
  ];

  constructor(  private paymentService: CustomersPaymentsService, 
                private modalService: ModalService, 
                private fb: FormBuilder ) { }


  ngOnInit(): void {
    this.form.get('bWorkOrderId')?.setValue(this.bWorkOrder.id)
  }

  closeModal(){
    this.modalService.closeModal();
  }


  async create( ) {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se añadira un cobro al cliente`,
      confirmButtonText: `¡Si, añadir!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    this.paymentService.addPaymentsToCustomer( { payment: this.form.value } )
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

          this.newPayment.emit();
          this.modalService.closeModal();
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


}
