import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Customer } from '../../interfaces';
import { DiaryEnventType } from 'src/app/dashboard/calendar/interfaces/diary-event-type.interface';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { DiaryEvent } from 'src/app/dashboard/calendar/interfaces/diary-event.interface';
import { CustomersService } from '../../services/customers.service';
import { DiaryEventsService } from 'src/app/dashboard/calendar/services/diary-events.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'agendar-modal',
  templateUrl: './agendar-modal.component.html',
  styleUrls: ['./agendar-modal.component.scss']
})
export class AgendarModalComponent implements OnInit {

  @Input() customerSelected!: Customer;

  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public types: DiaryEnventType[] = [];
  public customers: MultiSelectData[] = [];

  public diaryId: number = 1;

  public form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    customerId: [''],
    status: ['process'],
    diaryEnventTypeId: ['', Validators.required ],
    startDate: ['', Validators.required ],
    startTime: [''],
    finalDate: [''],
    finalTime: [''],
  });

  public dropdownSettingsSingle = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Selecciona cliente",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  }; 

  public diaryEvent!: DiaryEvent;


  constructor( private fb: FormBuilder, 
              private modalService: ModalService,
              private customerService: CustomersService,
              private diaryEventsService: DiaryEventsService ){
  }
  ngOnInit(): void {

    combineLatest([   
      this.diaryEventsService.getTypes(),
      this.customerService.getAllWithoutPagination(),
    ])
    .subscribe( combined => {
      this.types = combined[0].diaryEventTypes;
      this.customers = this.transformData(combined[1].customers);
    });

  }


  private transformData( customers: Customer[] ): MultiSelectData[] {
    return customers.map( customer => {
      return { id: customer.id, itemName: customer.name }
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
      text: `Se ${ this.isEdit ? 'actualizará la información del evento' : 'creará un nuevo evento' } `,
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
      diaryId: this.diaryId,
      customerId: this.customerSelected.id,
      startTime: this.form.get('startTime')?.value != '' ? this.form.get('startTime')?.value : null, 
      finalDate: this.form.get('finalDate')?.value != '' ? this.form.get('finalDate')?.value : null, 
      finalTime: this.form.get('finalTime')?.value != '' ? this.form.get('finalTime')?.value : null 
    }

    this.create( data )
    
    this.isSaving = false;
    this.formSubmitted = false;
  }

  create( formData: any ) {
    this.diaryEventsService.create( formData )
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
          this.modalService.closeModal();
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
          this.isSaving = false;
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

  errorMessage( campo: string  ): string {
    return this.form.get(campo)?.hasError('required') ? `Este campo es requerido.` :
           this.form.get(campo)?.hasError('minlength') ? `Mínimo 4 caracteres.` :
           this.form.get(campo)?.hasError('maxlength') ? `Maximo 13 caracteres.` : '';
  }



}
