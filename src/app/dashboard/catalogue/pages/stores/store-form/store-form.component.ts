import { Component, OnInit } from '@angular/core';
import { Store } from '../../../interfaces';
import { Employee } from 'src/app/dashboard/employees/interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { StoresService } from '../../../services/stores.service';
import { combineLatest, switchMap } from 'rxjs';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-store-form',
  templateUrl: './store-form.component.html',
  styleUrls: ['./store-form.component.scss']
})
export class StoreFormComponent implements OnInit {

  public store!: Store;
  public employees: Employee[] = [];
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    'employeeId': [null],
    'name': ['', Validators.required ],
    'ubication': ['', Validators.required],
    'observations': [''],
    'addEmployee': [false],
  }); 


  constructor( private fb: FormBuilder,
               private router: Router,
               private activatedRoute: ActivatedRoute,
               private employeesService: EmployeesService,
               private storesService: StoresService,
               private localStorageService: LocalStorageService,

               ){}


  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    ((permissions as number >> 2 ) % 2 == 1 ||  (permissions as number >> 2 ) % 2 == 1  )? true :  this.router.navigate(['/calendar/my-calendar']);

      combineLatest([   
        this.employeesService.getAllWithoutPagination(),
      ])
      .subscribe( combined => {
        this.employees = combined[0].employees;
      });
      
      if ( !this.router.url.includes('edit') ) { return; }
  
      this.isEdit = true;
      this.isLoading = true;
  
      this.activatedRoute.params
        .pipe(
          switchMap( ({ id }) => this.storesService.getById(id) )
        )
        .subscribe( (resp: any) =>{
          this.store = resp.store;
  
          const { 
            name,
            ubication,
            observations,
            employeeId } = this.store;
  
          this.form.setValue({
            name,
            ubication,
            observations,
            employeeId: employeeId ?? null,
            addEmployee: employeeId ? true : false
           });
  
          this.isLoading = false;
        });
  }



  async handleSubmit() {
    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del almacén' : 'creará un nuevo almacén' } `,
      confirmButtonText: `¡Si, ${ this.isEdit ? 'actualizar' : 'crear' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    const { addEmployee, ...formData } = this.form.value;

    if ( this.isEdit ) {
      this.update( this.store.id, formData );
      return;
    }

    this.create( formData );

  }


  create( formData: any ) {
    this.storesService.create( formData )
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
          this.router.navigate(['catalogue', 'stores', 'edit', resp.store.id])
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
    this.storesService.update( id, formData )
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

  changeModel( formName: string ) {
    switch ( formName ) {
      case 'addEmployee':
        if ( this.form.get('addEmployee')?.value == true ) {
          this.form.get('employeeId')?.setValidators([ Validators.required ]);
          this.form.get('employeeId')?.updateValueAndValidity();
          return;
        }
        this.form.get('employeeId')?.setValue('');
        this.form.get('employeeId')?.setValidators([]);
        this.form.get('employeeId')?.updateValueAndValidity();
        break;  
      default:
        break;
    }
  }

}
