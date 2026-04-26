import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Employee } from '../../interfaces';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/services/auth.service';
import { combineLatest } from 'rxjs';
import { AccessType, Role } from 'src/app/auth/interfaces';

@Component({
  selector: 'reset-password-modal',
  templateUrl: './reset-password-modal.component.html',
  styleUrls: ['./reset-password-modal.component.scss']
})
export class ResetPasswordModalComponent implements OnInit {

  @Input() employee!: Employee;
  
  public isLoading: boolean = false;

  public formSubmitted = false;

  public showPassword: boolean = false;


  public form = this.fb.group({
    userName: [ '', [ Validators.required, Validators.minLength(5), ] ],
    password: [ '', [ Validators.required, Validators.minLength(6), ] ],
    accessTypeId: ['', Validators.required ],
    roleId: ['', Validators.required ],
  });

  public accessTypes: AccessType[] = [];
  public roles: Role[] = [];

  constructor( private modalService: ModalService,
               private authService: AuthService,
               private fb: FormBuilder, ){}
  ngOnInit(): void {

    combineLatest([   
      this.authService.getAllAccessTypes(),
      this.authService.getAllRoles(),
    ])
    .subscribe( combined => {
      this.accessTypes = combined[0].accessTypes;
      this.roles = combined[1].roles;
    });

    console.log(this.employee.user)
    this.form.setValue({
      password: '',
      userName: this.employee.user.userName,
      accessTypeId: String(this.employee.user.accessTypeId),
      roleId: String(this.employee.user.roleId),
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


  async resetCredentials() {

    this.formSubmitted = true;

    if( this.form.invalid ) { return; }

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Estás seguro que deseas restablecer las credenciales del usuario ${ this.employee.user.userName }?`,
      confirmButtonText: `¡Si, restablecer!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isLoading = true;

    this.authService.resetCredentials( this.employee.user.uid, this.form.value as { password: string } )
      .subscribe({
        next: (resp: any) => {
          Swal.fire({
            icon: 'success',
            text: resp.message,
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          })
          this.isLoading = false;
          this.closeModal();
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
