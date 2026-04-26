import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Customer, CustomerType } from '../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomersService } from '../../services/customers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { UploadsService } from 'src/app/shared/services/uploads.service';
import { environment } from 'src/environments/environment.development';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnDestroy {


  @ViewChild('fileInput') fileInput!: ElementRef;
  public fileUrl: string = environment.apiUrl;


  public customer!: Customer;
  public customersTypes: CustomerType[] = [];
  
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    'typeId': [ 1, Validators.required],
    'name': ['', Validators.required ],
    'lastName': ['', Validators.required],
    // 'representative': [''],
    'contactName':  [''],
    'contactPhone':  [''],
    'contactEmail':  [''],
    'email': ['', [Validators.email]],
    'phone': ['', [Validators.minLength(10), Validators.maxLength(10)]],
    'cellPhone': ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    'rs': [''],
    'rfc': [''],
    'cfdi': [''],
    'observations': [''],
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
    'payType': ['', Validators.required],
    'creditDays': [null]
  });


  public file: any;

  public contacts: { name: string, phone: string; position: string, email: string }[] = [];

  constructor( private fb: FormBuilder,
               private customersService: CustomersService,
               private router: Router,
               private activatedRoute: ActivatedRoute,
               private uploadsService: UploadsService,
               public modalService: ModalService,
               public authService: AuthService,
              private location: Location  ){}
  ngOnDestroy(): void {
    this.customersService.setLeadTemp(null);
  }

  ngOnInit(): void {

    combineLatest([   
      this.customersService.getAllTypes(),
    ])
    .subscribe( combined => {
      this.customersTypes = combined[0].customersTypes;
    });
    
    if ( !this.router.url.includes('edit') ) { 
      if ( !this.customersService.leadTemp ) return;

      this.form.setValue({
        ...this.form.value,
        ...this.customersService.leadTemp
      });

      return; 
    }

    this.isEdit = true;
    this.isLoading = true;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.customersService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.customer = resp.customer;

        const { 
          type,
          name,
          lastName,
          email,
          phone,
          cellPhone,
          cfdi,
          rs,
          rfc,
          observations,
          // representative,
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
          contactName,
          contactPhone,
          contactEmail,
          payType,
          creditDays } = this.customer;


          this.contacts = this.customer.contacts;


        this.form.setValue({
          typeId: type.id,
          name,
          lastName,
          // representative,
          email,
          phone,
          cellPhone,
          cfdi,
          rs,
          rfc,
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
          contactName,
          contactPhone,
          contactEmail,
          payType,
          creditDays
         });

        this.isLoading = false;

        this.setValidations();
      });

  }


  async handleSubmit() {


    this.formSubmitted = true;

    if ( this.form.invalid ) return;


    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del cliente' : 'creará un nuevo cliente' } `,
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
      this.update( this.customer.id, data );
      return;
    }
  
    this.create( data );    

  }

  async create( formData: any ) {

    try {

      const resp = await this.customersService.create( formData ).toPromise();

      if ( !resp.status ) {
  
        Swal.fire({
          text: 'Oops! Ocurrio un error. Hable con el administrador.',
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
      }

      if ( this.file ) {
        await this.uploadsService.uploadCustomerCSFFile( resp.customer.id, this.file ).toPromise();
      }

      Swal.fire({
        text: resp.message,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
      this.router.navigate(['customers'])

      
    } catch (error: any) {
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
      
   


   
  }


  async update( id: number, formData: any ) {

    try {

      const resp = await this.customersService.update( id, formData ).toPromise();

      if ( !resp.status ) {
  
        Swal.fire({
          text: 'Oops! Ocurrio un error. Hable con el administrador.',
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
      }

      if ( this.file ) {
        await this.uploadsService.uploadCustomerCSFFile( id, this.file ).toPromise();
      }

      Swal.fire({
        text: resp.message,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
      this.isSaving = false;
      this.router.navigate(['customers/details', id]);


      
    } catch (error: any) {
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

  onChange( formName: string ) {

    switch ( formName ) {
      case 'typeId':

        if ( this.form.get(formName)?.value == 1 ) {
          this.form.get('lastName')?.setValidators([Validators.required]);
          this.form.get('lastName')?.updateValueAndValidity();
          return;
        } 

        this.form.get('lastName')?.setValue('');
        this.form.get('lastName')?.setValidators([]);
        this.form.get('lastName')?.updateValueAndValidity();
        return;

      case 'payType': 
          if ( this.form.get(formName)?.value == 2 ) {
            this.form.get('creditDays')?.setValidators([Validators.required]);
            this.form.get('creditDays')?.updateValueAndValidity();
            return;
          }

          this.form.get('creditDays')?.setValidators([]);
          this.form.get('creditDays')?.updateValueAndValidity();
          return;

      default:
        break;
    }

  }


  openSelectFile() {
    this.fileInput.nativeElement.click()
  }

  onChangeFileInput( files: any ) {
    if ( !files[0] ) return;
    this.file = files[0];
  }
  

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


  setValidations() {
    if ( this.form.get('typeId')?.value == 1 ) {
      this.form.get('lastName')?.setValidators([Validators.required]);
      this.form.get('lastName')?.updateValueAndValidity();
    }  else {
      this.form.get('lastName')?.setValue('');
      this.form.get('lastName')?.setValidators([]);
      this.form.get('lastName')?.updateValueAndValidity();
    }

    if ( this.form.get('payType')?.value == 2 ) {
      this.form.get('creditDays')?.setValidators([Validators.required]);
      this.form.get('creditDays')?.updateValueAndValidity();
    } else {
      this.form.get('creditDays')?.setValidators([]);
      this.form.get('creditDays')?.updateValueAndValidity();
    }
  }

  goToBack() {
    this.location.back()
  }

}

