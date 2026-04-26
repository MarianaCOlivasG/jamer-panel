import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ModalService } from 'src/app/shared/services/modal.service';
import { HtmlDescriptionsService } from '../../services/html-descriptions.service';
import { HtmlDescription } from '../../interfaces/html-description.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HtmlDescriptionsGeneralService } from '../../services/html-descriptions-general.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'html-description-general-form',
  templateUrl: './html-description-general-form.component.html',
  styleUrls: ['./html-description-general-form.component.scss']
})
export class HtmlDescriptionGeneralFormComponent {


  @Input() htmlDescription!: HtmlDescription;
  @Output() newHtmlDescriptionEvent = new EventEmitter<null>();

  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'title': ['', Validators.required],
    'htmlDescription': ['', Validators.required],
  });


  public editorConfig: AngularEditorConfig = {
    editable: true,
    height: '200px',
    sanitize: true,  
  }

  constructor( private fb: FormBuilder,
               private modalService: ModalService,
               private htmlDescriptionsService: HtmlDescriptionsGeneralService ) {

  }
  ngOnInit(): void {
    if ( !this.htmlDescription ) return;

    this.isEdit = true;

    const { title, htmlDescription } = this.htmlDescription;

    this.form.setValue({
      title,
      htmlDescription
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
      text: `Se ${ this.isEdit ? 'actualizará la plantilla' : 'creará una nueva plantilla' } `,
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
    this.htmlDescriptionsService.create({ ...this.form.value })
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
  
          this.newHtmlDescriptionEvent.emit();
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
    this.htmlDescriptionsService.update( this.htmlDescription.id ,{ ...this.form.value })
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
  
          this.newHtmlDescriptionEvent.emit();
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
