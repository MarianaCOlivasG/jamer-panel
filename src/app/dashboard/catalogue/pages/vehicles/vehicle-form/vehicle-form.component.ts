import { Component } from '@angular/core';
import { WorkTool } from '../../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkToolsService } from '../../../services/work-tools.service';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { Vehicle } from '../../../interfaces/vehicle.interface';
import { VehiclesService } from '../../../services/vehicles.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent {

  public vehicle!: Vehicle;
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    'brand': ['', Validators.required],
    'model': ['', Validators.required],
    'year': ['', Validators.required],
    'registration': ['', Validators.required],
    'color': ['', Validators.required],
    'policy': ['', Validators.required],
  });


  constructor( private fb: FormBuilder,
               private activatedRoute: ActivatedRoute,
               private router: Router,
               private vehiclesService: VehiclesService,
               private localStorageService: LocalStorageService,
               
  ){}
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    (((permissions as number >> 1 ) % 2 == 1) || ((permissions as number >> 2 ) % 2 == 1) )? true :  this.router.navigate(['/calendar/my-calendar']);

    if ( !this.router.url.includes('edit') ) { return; }

    this.isEdit = true;
    this.isLoading = true;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.vehiclesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.vehicle = resp.vehicle;

        const { 
          brand,
          model,
          year,
          registration,
          color,
          policy
        } = this.vehicle;

        this.form.setValue({
          brand,
          model,
          year,
          registration,
          color,
          policy
        });

        this.isLoading = false;
      });

  }


  async handleSubmit() {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del vehículo' : 'creará una nuevo vehículo' } `,
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
      this.update( this.vehicle.id, this.form.value );
      return;
    }

    this.create( this.form.value );

  }

  create( formData: any ) {
    this.vehiclesService.create( formData )
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
          this.router.navigate(['catalogue', 'vehicles','edit', resp.vehicle.id])
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
    this.vehiclesService.update( id, formData )
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


}
