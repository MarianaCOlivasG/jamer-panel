import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { BusinessFamily } from '../../../interfaces';
import { BusinessFamiliesService } from '../../../services/business-families.service';

@Component({
  selector: 'business-family-form-modal',
  templateUrl: './business-family-form-modal.component.html',
  styleUrls: ['./business-family-form-modal.component.scss']
})
export class BusinessFamilyFormModalComponent implements OnInit {

  @Input() businessFamily!: BusinessFamily | null;
  
  @Output() newFamily = new EventEmitter<null>();

  public isEdit: boolean = false
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'name': ['', Validators.required ],
    'description': ['', Validators.required ],
    'businessLineId': ['', Validators.required ],
  });

  constructor( private fb: FormBuilder, 
              private activatedRoute: ActivatedRoute,
              public modalService: ModalService,
              private businessFamiliesService: BusinessFamiliesService ){
  }
  ngOnInit() {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.form.get('businessLineId')?.setValue(id);
    });


    if ( !this.businessFamily ) return;

    this.isEdit = true;

    const {
        name,
        description,
        businessLineId
    } = this.businessFamily;
      
    this.form.setValue({
        name,
        description,
        businessLineId
      })


  }


  async handleSubmit() {
    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información de la familia' : 'creará una nueva familia' } `,
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
      this.update( this.businessFamily!.id, this.form.value );
      return;
    }

    this.create( this.form.value );

  }



  update( id: number, formData: any ) {
    this.businessFamiliesService.update( id, formData )
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
        this.newFamily.emit();
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


  create( formData: any ) {
    this.businessFamiliesService.create( formData )
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
          this.newFamily.emit();
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


  closeModal() {
    this.businessFamily = null;
    this.modalService.closeModal();
  }

}
