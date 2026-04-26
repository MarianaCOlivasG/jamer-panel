import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { BusinessLine } from '../../../interfaces';
import { BusinessLinesService } from '../../../services/business-lines.service';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-business-line-form',
  templateUrl: './business-line-form.component.html',
  styleUrls: ['./business-line-form.component.scss']
})
export class BusinessLineFormComponent {

  public businessLine!: BusinessLine;
  public businessLines: BusinessLine[] = [];
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    'name': ['', Validators.required ],
    'icon': ['', Validators.required ],
    'description': [''],
  });

  public icons: any[] = [
    { value: 'cucaracha.png'},
    { value: 'termita.png'},
    { value: 'raton.png'},
    { value: 'frasco.png'},
    { value: 'insecto.png'},
    { value: 'mosquito.png'},
    { value: 'virus.png'},
  ]


  constructor( private fb: FormBuilder,
               private businessLinesService: BusinessLinesService,
               private activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService,
               private router: Router,
               private location: Location ){}
      
               

  ngOnInit(): void {

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "business line")?.permissions );
    ((permissions as number >> 2 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);



    if ( !this.router.url.includes('edit') ) { return; }

    this.isEdit = true;
    this.isLoading = true;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.businessLinesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.businessLine = resp.businessLine;

        const { 
          name,
          icon,
          description,  
        } = this.businessLine;

        this.form.setValue({
          name,
          icon,
          description,
        });

        this.isLoading = false;
      });

  }


  async handleSubmit() {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información de la línea de negocio' : 'creará la línea de negocio' } `,
      confirmButtonText: `¡Si, ${ this.isEdit ? 'actualizar' : 'crear' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    if ( this.isEdit ) {
      this.update( this.businessLine.id, this.form.value );
      return;
    }

    this.create( this.form.value );

  }

  create( formData: any ) {
    this.businessLinesService.create( formData )
      .subscribe({
        next: (resp: any) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.router.navigate(['catalogue','business_lines', 'edit', resp.businessLine.id])
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
          this.isSaving = false;
        }
      });
  }


  update( id: number, formData: any ) {
    this.businessLinesService.update( id, formData )
      .subscribe({
        next: (resp: any) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
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
          this.isSaving = false;
        }
      });
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


  selectIcon( value : string ) {
    this.form.get('icon')?.setValue(value);
  }

  goToBack() {
    this.location.back()
  }
  
}

