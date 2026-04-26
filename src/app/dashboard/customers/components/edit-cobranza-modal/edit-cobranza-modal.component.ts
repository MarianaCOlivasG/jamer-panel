import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomersPaymentsService } from '../../services/payments.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'edit-cobranza-modal',
  templateUrl: './edit-cobranza-modal.component.html',
  styleUrls: ['./edit-cobranza-modal.component.scss']
})
export class EditCobranzaModalComponent implements OnInit {
  // Recibimos el objeto pago a editar. Se espera que incluya al menos: id, paymethod, amount, paymentAt, destinationAccount, complement y bWorkOrderId.
  @Input() payment: any;
  @Output() paymentUpdated = new EventEmitter<null>();

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'paymethod': ['', Validators.required],
    'amount': ['', Validators.required],
    'paymentAt': ['', Validators.required],
    'destinationAccount': ['', Validators.required],
    'complement': [''],
    'bWorkOrderId': [''],
  });

  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir',
  ];

  constructor(
    private fb: FormBuilder,
    private paymentsService: CustomersPaymentsService,
    public modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Si se recibe el pago, se inicializa el formulario con sus valores
    if (this.payment) {
      this.form.patchValue({
        paymethod: this.payment.paymethod,
        amount: this.payment.amount,
        // Se formatea la fecha para que sea compatible con el input de tipo date (yyyy-MM-dd)
        paymentAt: this.payment.paymentAt ? this.payment.paymentAt.substring(0,10) : '', 
        destinationAccount: this.payment.destinationAccount,
        complement: this.payment.complement,
        bWorkOrderId: this.payment.bWorkOrderId
      });
    }
  }

  closeModal() {
    this.modalService.closeModal();
  }

  async update() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se actualizará el pago',
      confirmButtonText: '¡Si, actualizar!',
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });
    if (!isConfirmed) return;

    this.isSaving = true;

    try {
      // Se asume que el método updatePayment existe en el servicio y recibe el id del pago y los nuevos datos del formulario
      const resp = await this.paymentsService.updatePayment(this.payment.id, this.form.value).toPromise();
      if (!resp.status) {
        Swal.fire({
          text: resp.message,
          icon: 'error',
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
        return;
      }
      Swal.fire({
        text: resp.message,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });
      this.paymentUpdated.emit();
      this.modalService.closeModal();
    } catch (error: any) {
      Swal.fire({
        text: error.message || 'Error al actualizar el pago',
        icon: 'error',
        timer: 2500,
        showConfirmButton: false
      });
      this.isSaving = false;
    }
  }

  async delete() {
    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'El pago se eliminará permanentemente',
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d33',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#3085d6',
      allowOutsideClick: false
    });
    if (!isConfirmed) return;

    this.isSaving = true;
    try {
      // Se asume que deletePayment existe en el servicio y recibe el id del pago a eliminar
      const resp = await this.paymentsService.deletePayment(this.payment.id).toPromise();
      if (!resp.status) {
        Swal.fire({
          text: resp.message,
          icon: 'error',
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
        return;
      }
      Swal.fire({
        text: resp.message,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });
      this.paymentUpdated.emit();
      this.modalService.closeModal();
    } catch (error: any) {
      Swal.fire({
        text: error.message || 'Error al eliminar el pago',
        icon: 'error',
        timer: 2500,
        showConfirmButton: false
      });
      this.isSaving = false;
    }
  }

  inputInvalid(campo: string): boolean | undefined {
    return this.form.get(campo)?.invalid && this.formSubmitted;
  }

  errorMessage(campo: string): string {
    if (this.form.get(campo)?.hasError('required')) {
      return 'Este campo es requerido.';
    }
    return '';
  }
}