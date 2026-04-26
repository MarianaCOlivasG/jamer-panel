import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Employee } from 'src/app/dashboard/employees/interfaces';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { WorkOrder } from '../../interfaces/work-order.interface';
import { WorkOrdersComponent } from '../../pages/work-orders/work-orders.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'cancel-modal',
  templateUrl: './cancel-modal.component.html',
  styleUrls: ['./cancel-modal.component.scss']
})
export class CancelModalComponent implements OnInit {

  @Input() workOrderSelected!: WorkOrder;

  public isLoading: boolean = true;
  public isSaving: boolean = false;

  public formSubmitted: boolean = false;
  public form: FormGroup = this.fb.group({
    'reason'  : ['', Validators.required ],
  });


  constructor( private parent: WorkOrdersComponent,
               public fb: FormBuilder,
               public modalService: ModalService,
               private employeesService: EmployeesService,
               private socketRouteService: SocketsRouteService,
               private authService: AuthService, ) {
  }

  ngOnInit(): void {

  }

  closeModal() {
    this.parent.closeModal();
  }

  async cancelWorkOrder() {

    this.formSubmitted = true;

    if( this.form.invalid ) { return; }

    this.isSaving = true;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se cancelará la orden de trabajo con el folio ${ this.workOrderSelected?.folio }`,
      confirmButtonText: `¡Si, cancelar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })
    console.log(isConfirmed)
    if ( !isConfirmed ) return;
    console.log("a")

    this.socketRouteService.cancelWorkOrder({id: this.workOrderSelected.id, reason: this.form.get('reason')?.value })
    .subscribe({
      next: (resp) => {
        console.log(resp);
        this.isSaving = false;
        this.parent.closeModal();
        this.parent.search(this.parent.querySearch);
      },
      error: (error) => {
        console.error('Error canceling work order:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cancelar la orden de trabajo. Inténtalo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        this.isSaving = false;
      }
    });
    this.isSaving = false;

  }

  inputInvalid( campo: string ): boolean {
    if ( this.form.get(campo)?.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }
  }

  errorMessage( campo: string  ): string {
    return this.form.get(campo)?.hasError('required') ? `Este campo es requerido.` :
           this.form.get(campo)?.hasError('minlength') ? `Mínimo 4 caracteres.` :
           this.form.get(campo)?.hasError('maxlength') ? `Maximo 13 caracteres.` : '';
  }


}

