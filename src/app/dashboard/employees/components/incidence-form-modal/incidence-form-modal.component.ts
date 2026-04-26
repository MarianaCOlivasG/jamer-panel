import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Employee, Incidence } from '../../interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/shared/services/modal.service';
import { IncidencesService } from '../../services/incidences.service';
import { EmployeesService } from '../../services/employees.service';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/services/auth.service';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'incidence-form-modal',
  templateUrl: './incidence-form-modal.component.html',
  styleUrls: ['./incidence-form-modal.component.scss']
})
export class IncidenceFormModalComponent implements OnInit {
  
  @Input() incidence!: Incidence;
  @Output() newIncidence = new EventEmitter<null>();

  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public employees: Employee[] = [];

  public form: FormGroup = this.fb.group({
    'title': ['', Validators.required],
    'description': ['', Validators.required],
    'employeeId': ['', Validators.required],
  });

  
  constructor( private fb: FormBuilder, 
    private modalService: ModalService,
    private incidencesService: IncidencesService,
    private employeesService: EmployeesService,
    private sockerRouteService: SocketsRouteService,
    private authService: AuthService ){
  }


  ngOnInit(): void {

   
    this.employeesService.getAllWithoutPagination()
      .subscribe( resp => {
        this.employees = resp.employees;
      })

    if ( !this.incidence ) return;

    this.isEdit = true;

    const { title, description, employeeId } = this.incidence;

    this.form.setValue({
      title,
      description,
      employeeId
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
      text: `Se ${ this.isEdit ? 'actualizará la información de la incidencia' : 'creará una nueva incidencia' } `,
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

    this.sockerRouteService.createIncidence(this.form.value).subscribe({
      next: (resp) => {
        Swal.fire({
          text: resp.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.newIncidence.emit();
      },
      error: (error) => {
        Swal.fire({
          text: error.error.message,
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

    this.sockerRouteService.updateIncidence(this.incidence.id, this.form.value).subscribe({
      next: (resp) => {
        Swal.fire({
          text: resp.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.newIncidence.emit();
      },
      error: (error) => {
        Swal.fire({
          text: error.error.message,
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
