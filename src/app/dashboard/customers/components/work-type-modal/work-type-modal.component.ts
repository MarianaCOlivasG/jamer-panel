import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { WorkType } from '../../interfaces/work-type.interface';
import { WorkTypesService } from '../../services/work-types.service';

@Component({
  selector: 'work-type-modal',
  templateUrl: './work-type-modal.component.html',
  styleUrls: ['./work-type-modal.component.scss']
})
export class WorkTypeModalComponent implements OnInit {


  @Input() workType!: WorkType;
  @Output() newWorkType = new EventEmitter<null>();

  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public workTypes: WorkType[] = [];

  public form: FormGroup = this.fb.group({
    'value': ['', Validators.required],
  });


  constructor( private fb: FormBuilder,
               private modalService: ModalService,
               private workTypesService: WorkTypesService ) {

  }
  ngOnInit(): void {
    if ( !this.workType ) return;

    this.isEdit = true;

    const { value } = this.workType;

    this.form.setValue({
      value
    })
  }

  closeModal() {
    this.modalService.closeModal();
  }


  async handleSubmit() { 

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del puesto de trabajo' : 'creará un nuevo puesto de trabajo' } `,
      confirmButtonText: `¡Si, ${ this.isEdit ? 'actualizar' : 'crear' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;


    if ( !this.isEdit ) {
      this.create()
    } else {
      this.update();
    }
    
    this.isSaving = false;
    this.formSubmitted = false;

  }

  async create() {
    this.workTypesService.create({...this.form.value, key: String(this.form.get('value')?.value).replace(/ /g, '-')})
      .subscribe({
        next: ( resp ) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
  
          this.newWorkType.emit();
        },
        error: ( error ) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }

  async update() {
    this.workTypesService.update( this.workType.id ,{...this.form.value, key: String(this.form.get('value')?.value).replace(/ /g, '-')})
      .subscribe({
        next: ( resp ) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
  
          this.newWorkType.emit();
        },
        error: ( error ) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
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
