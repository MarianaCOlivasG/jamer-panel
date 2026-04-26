import { Component } from '@angular/core';
import { Supplier, SuppliersType } from '../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss']
})
export class SupplierFormComponent {

  public supplier!: Supplier;
  public suppliersTypes: SuppliersType[] = [];
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    'typeId': [ 1, Validators.required],
    'name': ['', Validators.required ],
    'email': ['', [Validators.required, Validators.email]],
    'phone': [''],
    'rs': ['', Validators.required],
    'rfc': ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)] ],
    'cellPhone': ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    'observations': [''],
    // 'cfdi': [''],
    'address_street': [''],
    'address_no_ext': [''],
    'address_no_int': [''],
    'address_between_street': [''],
    'address_cp': ['', Validators.required ],
    'address_state': [''],
    'address_locality': [''],
    'address_municipality': [''],
    'address_colony': [''],
    'address_references': [''],
  });


  public contacts: { name: string, email: string, position: string, phone: string }[] = [];

  constructor( private fb: FormBuilder,
               private suppliersService: SuppliersService,
               private router: Router,
               private activatedRoute: ActivatedRoute,
               public authService: AuthService,
               public modalService: ModalService,
               private location: Location,
               private localStorageService: LocalStorageService,
               ){}

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "suppliers")?.permissions );
    ((permissions as number >> 1 ) % 2 == 1|| ((permissions as number >> 2 ) % 2 == 1))? true :  this.router.navigate(['/calendar/my-calendar']);

    combineLatest([   
      this.suppliersService.getAllTypes(),
    ])
    .subscribe( combined => {
      this.suppliersTypes = combined[0].suppliersTypes;
    });
    
    if ( !this.router.url.includes('edit') ) { return; }

    this.isEdit = true;
    this.isLoading = true;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.suppliersService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.supplier = resp.supplier;

        const { 
          type,
          rs,
          rfc,
          name,
          email,
          phone,
          cellPhone,
          // cfdi,
          observations,
          address_street,
          address_no_ext,
          address_no_int,
          address_between_street,
          address_cp,
          address_state,
          address_locality,
          address_municipality,
          address_colony,
          address_references,
          } = this.supplier;


          this.contacts = this.supplier.contacts;

        this.form.setValue({
          typeId: type.id,
          rs,
          rfc,
          name,
          email,
          phone,
          cellPhone,
          observations,
          // cfdi,
          address_street,
          address_no_ext,
          address_no_int,
          address_between_street,
          address_cp,
          address_state,
          address_locality,
          address_municipality,
          address_colony,
          address_references,
         });

        this.isLoading = false;
      });

  }


  async handleSubmit() {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del proveedor' : 'creará un nuevo proveedor' } `,
      confirmButtonText: `¡Si, ${ this.isEdit ? 'actualizar' : 'crear' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;


    const data = {
      ...this.form.value,
      contacts: this.contacts
    }

    if ( this.isEdit ) {
      this.update( this.supplier.id, data );
      return;
    }

    this.create( data );

  }

  create( formData: any ) {
    this.suppliersService.create( formData )
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
          this.router.navigate(['suppliers'])
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
    this.suppliersService.update( id, formData )
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

//   onChange( formName: string ) {

//     switch ( formName ) {
//       case 'typeId':

//         if ( this.form.get(formName)?.value == 1 ) {
//           this.form.get('representative')?.setValue('');

//           this.form.get('lastName')?.setValidators([Validators.required]);
//           this.form.get('representative')?.setValidators([]);

//           this.form.get('lastName')?.updateValueAndValidity();
//           this.form.get('representative')?.updateValueAndValidity();
//           return;
//         } 

//         this.form.get('lastName')?.setValue('');

//         this.form.get('representative')?.setValidators([Validators.required]);
//         this.form.get('lastName')?.setValidators([]);

//         this.form.get('lastName')?.updateValueAndValidity();
//         this.form.get('representative')?.updateValueAndValidity();
//         return;
//       default:
//         break;
//     }

//   }


  addContact() {
    this.modalService.openModal();
  }


  newContact(event: { name: string, email: string, position: string, phone: string }) {
    this.contacts.push(event);
    this.modalService.closeModal();
  }
  

  deleteContact( index: number ) {
    this.contacts.splice(index, 1);
  }

  goToBack() {
    this.location.back();
  }
}

