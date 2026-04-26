import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Employee } from '../../interfaces';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, switchMap } from 'rxjs';
import { AccessType, Role } from 'src/app/auth/interfaces';
import Swal from 'sweetalert2';
import { EmployeesService } from '../../services/employees.service';

@Component({
  selector: 'credentials-modal',
  templateUrl: './credentials-modal.component.html',
  styleUrls: ['./credentials-modal.component.scss']
})
export class CredentialsModalComponent implements OnInit {

  @Input() employee!: Employee;
  @Output() newCredentials = new EventEmitter<null>();


  public accessTypes: AccessType[] = [];
  public roles: Role[] = [];


  public isLoading: boolean = false;

  public formSubmitted = false;
  public showPassword: boolean = false;

  public form: FormGroup = this.fb.group({
     userName: ['', Validators.required ],
     password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(13)]],
     accessTypeId: ['', Validators.required ],
     roleId: ['', Validators.required ],
  });;


  constructor(  private modalService: ModalService,
                private authService: AuthService,
                private employeesService: EmployeesService,
                private fb: FormBuilder ){}


  ngOnInit(): void {
    combineLatest([   
      this.authService.getAllAccessTypes(),
      this.authService.getAllRoles(),
    ])
    .subscribe( combined => {
      this.accessTypes = combined[0].accessTypes;
      this.roles = combined[1].roles;
    });
  }

  closeModal() {
    this.modalService.closeModal();
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
             this.form.get(campo)?.hasError('minlength') ? `Mínimo 6 caracteres.` : '';
  }

  async createAccount() {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se creará un acceso al sistema al empleado ${ this.employee.name }`,
      confirmButtonText: `¡Si, crear!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isLoading = true;

    this.authService.create( this.form.value )
      .pipe(
        switchMap( ({user}: any) =>   this.employeesService.update( this.employee.id, {...this.employee, userUid: user.uid }) )
      ).subscribe({
        next: ( resp ) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.newCredentials.emit();
          this.modalService.closeModal();
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
          this.isLoading = false;
        }
      })


  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('inputPassword') as HTMLInputElement;
    passwordInput.type = this.showPassword ? 'text' : 'password';
  }


}
