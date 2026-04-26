import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Employee } from 'src/app/dashboard/employees/interfaces';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { WorkOrder } from '../../interfaces/work-order.interface';
import { WorkOrdersComponent } from '../work-orders/work-orders.component';
import { WorkOrderFormEditComponent } from '../work-order-form-edit/work-order-form-edit.component';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'assign-to-modal',
  templateUrl: './assign-to-modal.component.html',
  styleUrls: ['./assign-to-modal.component.scss']
})
export class AssignToModalComponent implements OnInit {

  @Input() workOrderSelected!: WorkOrder;
  @Input() currentTechnicals: number[] = [];
  @Output() assingToEvent = new EventEmitter<null>();

  public isLoading: boolean = true;
  public technicals: CheckEmployee[] = [];
  public isSaving: boolean = false;

  public errorsControl: { hasError: boolean, message: string } = {
    hasError: false,
    message: ''
  }

  constructor( private parent: WorkOrdersComponent,
              private parent2: WorkOrderFormEditComponent,
               public modalService: ModalService,
               private employeesService: EmployeesService,
               private socketRouteService: SocketsRouteService,
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
        onSelect: this.currentTechnicals.includes(employee.id) 
      }
    })
  }

  closeModal() {
    this.parent.closeModal();
    this.parent2.closeModal();
  }


  onSubmit() {
    this.isSaving = true;
    const selected = this.technicals.filter( tech =>  tech.onSelect );

    if ( selected.length == 0 ) {
      this.errorsControl = {
        hasError: true,
        message: 'Almenos un técnico es requerido.'
      }
      this.isSaving = false;
      return;
    }

    this.errorsControl = {
      hasError: false,
      message: ''
    }

    //  formData: {
    //      id: number | string,
    //      employeesIds: []
    //  }
    const formData = {
      id: this.workOrderSelected.id,
      employeesIds: selected.map( employee => employee.id )
    }

 
    this.socketRouteService.assignemployeesToWorkOrder(formData)
    .subscribe({
      next: (resp: any) => {
        Swal.fire({
          title: 'Asignación exitosa',
          text: 'Técnicos asignados correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.assingToEvent.emit();
        this.closeModal();
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error.msg || 'Error al asignar técnicos.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      },
      complete: () => {
        this.isSaving = false;
      }
    });
    this.isSaving = false;
  }


 


}


interface CheckEmployee extends Employee {
  onSelect: boolean;
}