import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentsService } from 'src/app/dashboard/purchases/services/payments.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CashRegisterService } from '../../services/cash-register.service';

@Component({
  selector: 'cash-register-valid-modal',
  templateUrl: './cash-register-valid-modal.component.html',
  styleUrls: ['./cash-register-valid-modal.component.scss']
})
export class CashRegisterValidModalComponent implements OnInit {

  @Output() newRegister = new EventEmitter<boolean>();

  @Input() registerSelected: any;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'concept': ['', Validators.required ],
    'amount': ['', Validators.required ],
    'movement': ['E', Validators.required ],
    'employeeId': ['', Validators.required ],
  }); 

  public isEdit: boolean = false;


  public cashRegister: any;

  constructor(  private cashRegisterService: CashRegisterService, 
                private modalService: ModalService, 
                private fb: FormBuilder,
                private workOrderService: WorkOrdersService,
                private authService: AuthService ) { }


  ngOnInit(): void {
    this.form.get('employeeId')?.setValue(this.authService.user.id);

    const { id } = this.registerSelected;

    this.cashRegisterService.getDetails( id )
      .subscribe( resp => {
        this.cashRegister = resp['cashRegister'];
      })


  }
 

  closeModal(){
    this.newRegister.emit(false);
  }


  async submit( ) {


    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se validará el registro en Caja`,
      confirmButtonText: `¡Si, validar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.cashRegisterService.validate( this.cashRegister.id )
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
          this.newRegister.emit(true);

        },
        error: ( error ) => {
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