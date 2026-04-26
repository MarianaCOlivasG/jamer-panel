import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Employee } from 'src/app/dashboard/employees/interfaces';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { Vehicle } from '../../interfaces/vehicle.interface';
import { VehiclesComponent } from '../../pages/vehicles/vehicles.component';
import { VehiclesService } from '../../services/vehicles.service';

@Component({
  selector: 'assign-to-modal',
  templateUrl: './assign-to-modal.component.html',
  styleUrls: ['./assign-to-modal.component.scss']
})
export class AssignToModalComponent implements OnInit {

  @Input() vehicleSelected!: Vehicle;
  @Output() assingToEvent = new EventEmitter<null>();

  public isLoading: boolean = true;
  public technicals: CheckEmployee[] = [];
  public isSaving: boolean = false;

  public errorsControl: { hasError: boolean, message: string } = {
    hasError: false,
    message: ''
  }

  constructor( 
              private parent: VehiclesComponent,
               public modalService: ModalService,
               private employeesService: EmployeesService,
               private vehiclesService: VehiclesService,
               private authService: AuthService, ) {
  }

  ngOnInit(): void {
    this.getTechnicals();
  }

  getTechnicals() {
    this.isLoading = true;
    this.employeesService.getTechnicalsWithoutPaginationNoMultiSelect()
      .subscribe( resp => {
        this.technicals = this.transformData(resp.employees);
        this.isLoading = false;
      })
  }

  private transformData( employees: Employee[] ): CheckEmployee[] {
    return employees.map( employee => {
      return {
        ...employee,
        onSelect: false
      }
    })
  }

  closeModal() {
    this.parent.closeModal();
  }


  onSubmit() {
    this.isSaving = true;
    const selected = this.technicals.filter( tech =>  tech.onSelect );

    if ( selected.length == 0 ) {
      this.errorsControl = {
        hasError: true,
        message: 'Selecciona un técnico.'
      }
      this.isSaving = false;
      return;
    }

    this.vehiclesService.assignTo( this.vehicleSelected.id, selected[0].id )
      .subscribe({
        next: (resp: any) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

          this.isSaving = false;

          this.assingToEvent.emit();
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





  choose( technicalId: number ) {
    const technical = this.technicals.find( t => t.id == Number(technicalId));
    technical!.onSelect = true;
  }

}


interface CheckEmployee extends Employee {
  onSelect: boolean;
}