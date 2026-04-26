import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { CustomersService } from '../../services/customers.service';
import { Address } from '../../interfaces/address.interface';

@Component({
  selector: 'address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss']
})
export class AddressModalComponent implements OnInit {

  @Output() newAddress = new EventEmitter<null>();
  @Input() addressSelected!: Address; 
 
  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'name': ['', Validators.required],
    'address': ['', Validators.required],
    'lat': ['', Validators.required ],
    'lng': ['', Validators.required],
    'references': [''],
    'phone': ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    'contactName': ['', [Validators.required]],
  });

  public customerId!: number;

  public position: { lat: number, lng: number } = { lat: 21.1207331, lng:-86.8839398 }; 

  constructor( private fb: FormBuilder, 
               private activatedRoute: ActivatedRoute,
               private modalService: ModalService,
               private customersService: CustomersService ){
  }


  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.customerId = +id;
    });

    if ( this.addressSelected ) {
      this.isEdit = true;
      const {
        name,
        address,
        lat,
        lng,
        references,
        phone,
        contactName
      } = this.addressSelected;
      this.form.setValue({
        name,
        address,
        lat,
        lng,
        references,
        phone,
        contactName
      })

      this.position = { lat, lng };
      console.log(this.position)
    }
  }

  closeModal() {
    this.modalService.closeModal();
  }


  newLatLng( coords: { lat: number, lng: number } ) {
    this.form.get('lat')?.setValue(coords.lat);
    this.form.get('lng')?.setValue(coords.lng);
  }


  async handleSubmit() {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información de la sede' : 'creará una nueva sede' } `,
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
      this.update( this.addressSelected.id, this.form.value );
      return;
    }

    this.create( this.customerId, this.form.value );
  }


  update( id: number, formData: any ) {
    this.customersService.updateAddress( id, formData )
      .subscribe({
      next: (resp) => {
        console.log(resp)
        Swal.fire({
          text: resp.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.newAddress.emit();
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


  create( customerId: number, formData: any ) {
    this.customersService.createAddressByCustomerId( customerId, formData )
      .subscribe({
        next: (resp) => {
          console.log(resp)
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.newAddress.emit();
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
