import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'contact-modal',
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.scss']
})
export class ContactModalComponent implements OnInit {

  @Output() newContact = new EventEmitter<{ name: string, email: string, position: string, phone: string }>();;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    name: ['', Validators.required ],
    email: ['', [Validators.email] ],
    position: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)] ],
  }); 
  

  constructor(  private modalService: ModalService, 
                private fb: FormBuilder ) { }


  ngOnInit(): void {
  }

  closeModal(){
    this.modalService.closeModal();
  }


  async create( ) {

    this.formSubmitted = true;
    if ( this.form.invalid ) return;

    this.newContact.emit({...this.form.value});
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
