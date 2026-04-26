import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DiaryEnventType } from '../../interfaces/diary-event-type.interface';
import { DiaryEventTypesService } from '../../services/diary-events-types.service';

@Component({
  selector: 'diary-event-type-modal',
  templateUrl: './diary-event-type-modal.component.html',
  styleUrls: ['./diary-event-type-modal.component.scss']
})
export class DiaryEventTypeModalComponent implements OnInit {


  @Input() diaryEnventType!: DiaryEnventType;
  @Output() newDiaryEventType = new EventEmitter<null>();

  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public diaryEventTypes: DiaryEnventType[] = [];

  public form: FormGroup = this.fb.group({
    'value': ['', Validators.required],
    'color': ['#ff0000'],
  });


  constructor( private fb: FormBuilder,
               private modalService: ModalService,
               private diaryEventTypesService: DiaryEventTypesService ) {

  }
  ngOnInit(): void {
    if ( !this.diaryEnventType ) return;

    this.isEdit = true;

    const { value, color } = this.diaryEnventType;

    this.form.setValue({
      value,
      color
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
      text: `Se ${ this.isEdit ? 'actualizará la información del tipo de evento' : 'creará un nuevo tipo de evento' } `,
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

    this.diaryEventTypesService.create({...this.form.value, key: String(this.form.get('value')?.value).replace(/ /g, '-')})
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
  
          this.newDiaryEventType.emit();
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
    this.diaryEventTypesService.update( this.diaryEnventType.id ,{...this.form.value, key: String(this.form.get('value')?.value).replace(/ /g, '-')})
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
  
          this.newDiaryEventType.emit();
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
