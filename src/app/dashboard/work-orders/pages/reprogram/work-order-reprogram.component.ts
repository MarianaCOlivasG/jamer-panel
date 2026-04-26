import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrdersService } from '../../services/work-orders.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-workorderreprogram',
  templateUrl: './work-order-reprogram.component.html',
  styleUrls: ['./work-order-reprogram.component.css']
})
export class WorkorderreprogramComponent implements OnInit {
  public workOrder: any = null;
  public isLoading: boolean = true;
  public newStartDate: string = '';
  public newStartTime: string = '';
  public newFinalDate: string = '';
  public newFinalTime: string = '';

  constructor(
    private route: ActivatedRoute,
    private workOrdersService: WorkOrdersService,
    public router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWorkOrder(id);
    } else {
      Swal.fire({ text: 'No se proporcionó el ID de la orden de trabajo', icon: 'error' });
      this.router.navigate(['/work-orders']);
    }
  }

  loadWorkOrder(id: string): void {
    this.isLoading = true;
    this.workOrdersService.getById(Number(id)).subscribe(
      (resp: any) => {
        this.workOrder = resp.workOrder;
        this.isLoading = false;
        this.newStartDate = this.formatDateInput(this.workOrder.startDate);
        this.newStartTime = this.workOrder.startTime;
        this.newFinalDate = this.formatDateInput(this.workOrder.finalDate);
        this.newFinalTime = this.workOrder.finalTime;
      },
      error => {
        Swal.fire({ text: 'Error al cargar la orden de trabajo.', icon: 'error' });
        this.isLoading = false;
      }
    );
  }

  reprogram(): void {
    if (!this.newStartDate || !this.newStartTime || !this.newFinalDate || !this.newFinalTime) {
      Swal.fire({ text: 'Complete todos los campos.', icon: 'warning' });
      return;
    }
    
    const startDateTime = new Date(`${this.newStartDate}T${this.newStartTime}`);
    const finalDateTime = new Date(`${this.newFinalDate}T${this.newFinalTime}`);
    
    if (finalDateTime < startDateTime) {
      Swal.fire({ text: 'La fecha y hora de terminación no pueden ser anteriores a la fecha y hora de inicio.', icon: 'warning' });
      return;
    }

    const id = this.workOrder.id;
    const data = {
      startDate: this.newStartDate,
      startTime: this.newStartTime,
      finalDate: this.newFinalDate,
      finalTime: this.newFinalTime
    };
    this.workOrdersService.reprogramWorkOrder(id, data).subscribe(
      (resp: any) => {
        if (resp.status) {          
          Swal.fire({ text: resp.message, icon: 'success' });
          this.router.navigate(['/work-orders/details', resp.newWorkOrder.id]);
        } else {
          Swal.fire({ text: resp.message, icon: 'error' });
        }
      },
      error => {
        Swal.fire({ text: 'Ocurrió un error al reprogramar la orden de trabajo.', icon: 'error' });
      }
    );
  }

  formatDateInput(date: any): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) { month = '0' + month; }
    if (day.length < 2) { day = '0' + day; }
    return [year, month, day].join('-');
  }
}