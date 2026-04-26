import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Budget } from '../../interfaces/budget.interface';
import { ActivatedRoute } from '@angular/router';
import { BudgetsService } from '../../services/budgets.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Swal from 'sweetalert2';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Contract } from '../../interfaces/contract.interface';
import { ContractsService } from '../../services/contracts.service';
import { ExpiringContractsComponent } from '../expiring-contracts/expiring-contracts.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'contract-renew-modal',
  templateUrl: './contract-renew-modal.component.html',
  styleUrls: ['./contract-renew-modal.component.scss']
})
export class ContractRenewModalComponent {

  @Output() renewSuccess = new EventEmitter<null>();
  @Input() contractId: number = 0;

  public contract!: Contract; 
  public isSaving: boolean = false;
  public isLoading: boolean = true;
  public fileUrl: string = environment.apiUrl;

  public formSubmitted: boolean = false;

  public form: FormGroup = this.fb.group({
    'expirationDate': ['', Validators.required ],
  });

  constructor( private expiringContractsComponent: ExpiringContractsComponent,
               private contractsService: ContractsService,
               public authService: AuthService,
               public modalService: ModalService,
               private fb: FormBuilder, ){}

  ngOnInit(): void {
    this.contractsService.getById(this.contractId).subscribe( (resp: any) =>{
        this.contract = resp.contract;
        this.isLoading = false;
      });
  }

  
  closeModal() {
    this.expiringContractsComponent.closeModal();
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


  async submit() {
    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se renovará el contrato con el folio ${ this.contract.folio }`,
      confirmButtonText: `¡Si, renovar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.contractsService.renew( String(this.contractId), this.form.value )
      .subscribe({
        next: ( resp ) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.renewSuccess.emit();
        },
        error: ( error ) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }
}
