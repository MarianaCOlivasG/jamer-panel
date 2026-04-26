import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DiaryEvent } from '../../interfaces/diary-event.interface';
import { Customer } from 'src/app/dashboard/customers/interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/shared/services/modal.service';
import { CustomersService } from 'src/app/dashboard/customers/services/customers.service';
import { DiaryEnventType } from '../../interfaces/diary-event-type.interface';
import { combineLatest } from 'rxjs';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import Swal from 'sweetalert2';
import { DiaryEventsService } from '../../services/diary-events.service';

@Component({
  selector: 'diary-event-modal',
  templateUrl: './diary-event-modal.component.html',
  styleUrls: ['./diary-event-modal.component.scss']
})
export class DiaryEventModalComponent implements OnInit {

  @Input() diaryId!: number; //ID del calendarip
  @Input() diaryEventId!: number;
  @Output() newDiaryEvent = new EventEmitter<null>();

  public isEdit: boolean = false;
  
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;

  public isSaving: boolean = false;

  public types: DiaryEnventType[] = [];
  public customers: MultiSelectData[] = [];

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

    if ( this.diaryEventId == 0 ) return;

    this.isEdit = true;

    this.diaryEventsService.getById( this.diaryEventId )
      .subscribe({
        next: (resp) => {
          this.diaryEvent = resp.diaryEnvent;

          const {
            title,
            diaryEnventTypeId,
            customer,
            startDate,
            startTime,
            finalDate,
            finalTime,
            description,
            status
          } = this.diaryEvent;

          this.form.setValue({
            title,
            diaryEnventTypeId,
            customerId: customer ? [{ id: customer.id, itemName: customer.name }] : [],
            startDate,
            startTime,
            finalDate,
            finalTime,
            description,
            status
          })

        },
      })

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
      title: (this.form.get('customerId')?.value as any[]).length > 0 ? `${this.form.get('title')?.value} | ${this.form.get('customerId')?.value[0]['itemName']} ` : this.form.get('title')?.value,
      diaryId: this.diaryId,
      customerId: (this.form.get('customerId')?.value as any[]).length > 0 ? this.form.get('customerId')?.value[0].id :  null,
      startTime: this.form.get('startTime')?.value != '' ? this.form.get('startTime')?.value : null, 
      finalDate: this.form.get('finalDate')?.value != '' ? this.form.get('finalDate')?.value : null, 
      finalTime: this.form.get('finalTime')?.value != '' ? this.form.get('finalTime')?.value : null 
    }



    if ( !this.isEdit ) {
      this.create( data )
    } else {
      this.update( this.diaryEventId ,data );
    }
    
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
          this.newDiaryEvent.emit();
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


  update( diaryEventId: number , formData: any ) {
    this.diaryEventsService.update( diaryEventId, formData )
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
          // this.modalService.closeModal();
          this.newDiaryEvent.emit();
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



  onItemSelect(item:any){
    console.log(item);
  }
  OnItemDeSelect(item:any){
      console.log(item);
  }
  onSelectAll(items: any){
      console.log(items);
  }
  onDeSelectAll(items: any){
      console.log(items);
  }



}
