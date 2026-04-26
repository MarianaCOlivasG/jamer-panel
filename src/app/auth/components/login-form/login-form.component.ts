import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {


  public formSubmitted: boolean = false;
  public isLoading: boolean = false;
  public showPassword: boolean = false;

  public form: FormGroup = this.fb.group({
    'userName'   : [ localStorage.getItem('userName') || '', [ Validators.required, Validators.minLength(4), Validators.maxLength(13)]],
    'password'  : ['', Validators.required ],
    'remember': [ localStorage.getItem('userName') ? true : false ],
  });

  constructor( private fb: FormBuilder,
               private router: Router,
               private authService: AuthService ) { }



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




    login(): void {

      this.formSubmitted = true;

      if( this.form.invalid ) { return; }

      this.isLoading = true;

      this.authService.login( this.form.value )
      .subscribe({
        next: (resp) => {

          if (this.form.get('remember')?.value) {
            localStorage.setItem('userName', this.form.get('userName')?.value )
          } else {
           // localStorage.removeItem('userName');
          }

          this.router.navigateByUrl('/')

        },
        error: (error: any) => {

          console.log(error)
          this.isLoading = false;

          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

        }
      });

    }

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
      const passwordInput = document.getElementById('inputPassword') as HTMLInputElement;
      if (this.showPassword) {
        passwordInput.type = 'text';
      } else {
        passwordInput.type = 'password';
      }
    }

}
