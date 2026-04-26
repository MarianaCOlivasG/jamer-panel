import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Maintenance } from '../../interfaces/maintenance.interface';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment-timezone';
import { DatePipe } from '@angular/common';
import { MaintenanceVehicleService } from '../../services/maintenance-vehicle.service';


@Component({
  selector: 'maintenance-vehicle-modal',
  templateUrl: './maintenance-vehicle-modal.component.html',
  styleUrls: ['./maintenance-vehicle-modal.component.scss']
})
export class MaintenanceVehicleModalComponent implements OnInit {


  public vehicleId!: number;
  @Input() maintenance!: Maintenance;
  @Output() newMaintenance = new EventEmitter<null>();

  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'departureDate': ['', Validators.required],
    'observations': ['', Validators.required],
  });


  constructor( private fb: FormBuilder,
               private modalService: ModalService,
               private maintenanceService: MaintenanceVehicleService,
               private activatedRoute: ActivatedRoute ) {

  }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe( ({id}) => {
      this.vehicleId = +id;
    });

    if ( !this.maintenance ) return;

    this.isEdit = true;

    const { departureDate, observations } = this.maintenance;

    const datePipe = new DatePipe("en-US");

    this.form.setValue({
      departureDate: datePipe.transform(departureDate, 'yyyy-MM-dd'),
      observations
    });

  }

  closeModal() {
    this.modalService.closeModal();
  }


  async handleSubmit() { 

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${ this.isEdit ? 'actualizará la información del mantenimiento' : 'creará un nuevo mantenimiento' } `,
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

    this.maintenanceService.create({...this.form.value, vehicleId: this.vehicleId, isCurrent: true})
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
  
          this.newMaintenance.emit();
        },
        error: ( error ) => {
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
    this.maintenanceService.update( this.maintenance.id, {...this.form.value, workToolId: this.vehicleId})
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
  
          this.newMaintenance.emit();
        },
        error: ( error ) => {
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
