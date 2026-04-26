import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { WorkOrder } from '../interfaces/work-order.interface';
import * as moment from 'moment-timezone';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class WorkOrdersService {

  constructor( private http: HttpClient ) { }
  getWorkOrdersByBudgetId(budgetId: number) {
    return this.http.get<any>(`${baseUrl}/work-orders/by-budget/${budgetId}`);
  }
  
  getByCustomerId(customerId: number): Observable<{ workOrders: WorkOrder[] }> {
    return this.http.get<{ workOrders: WorkOrder[] }>(`${baseUrl}/work-orders/customer/${customerId}`);
  }
  getAllWithoutPagination(customerId: number = 0): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${baseUrl}/work-orders/all-none?customerId=${customerId}`));
  }

  getAll(page: number = 1, limit: number = 20, employeesIds: string, customerId: number, statusId: number, date: string, isValidated: number  ) {
    return this.http.get<any>(`${baseUrl}/work-orders/all?page=${page}&limit=${limit}&employeesIds=${employeesIds}&customerId=${customerId}&statusId=${statusId}&date=${date}&isValidated=${isValidated}`);
  }

  getWorkOrdersByCustomerId(customerId: number, document: 'R' | 'F' | 'ALL' = 'ALL' ) {
    return this.http.get<any>(`${baseUrl}/work-orders-solutions/all-customer/${customerId}?facturaOrRemision=${document}`);
  }

  search(page: number = 1, limit: number = 20, queryString: string, employeesIds: string, customerId: number, statusId: number, date: string, isValidated: number  ) {
    return this.http.get<any>(`${baseUrl}/work-orders/search/${queryString}?page=${page}&limit=${limit}&employeesIds=${employeesIds}&customerId=${customerId}&statusId=${statusId}&date=${date}&isValidated=${isValidated}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/work-orders/details/${id}`);
  }
  getByContractId(id: number) {
    return this.http.get<any>(`${baseUrl}/work-orders/contract/${id}`);
  }
  generatePDF( id: number ) {
    return this.http.get<any>(`${baseUrl}/work-orders/pdf/${id}`);
  }

  sendEmail( id: string, emails: string[] ) {
    return this.http.post<any>(`${baseUrl}/work-orders/send-email/${id}`, { emails });
  }

  updateTimes( id: string, data: any ) {
    return this.http.put<any>(`${baseUrl}/work-orders/update-times/${id}`, data );
  }


  cancelled( id: string ) {
    return this.http.get<any>(`${baseUrl}/work-orders/cancelled/${id}`, );
  }


  getPlanning2(  ) {
    return this.http.get<any>(`${baseUrl}/work-orders/planning`)
    .pipe( map( (resp: any) => {
      return this.transformWorkOrders(resp.planning)
    }))
  }

  getPlanning(filterDate: string = "") {
    // Build URL with filterDate only if provided and not empty.
    let url = `${baseUrl}/work-orders/planning`;
    if (filterDate && filterDate !== "") {
      url += `?date=${filterDate}`;
    }
    return this.http.get<any>(url)
      .pipe(
        map((resp: any) => {
          return {
            planning: this.transformWorkOrders(resp.planning),
          };
        })
      );
  }

  private transformWorkOrders(workOrders: WorkOrder[]) {
    return workOrders.map(workOrder => {
      const formatTime = (time: string) => time.padStart(5, '0');
      return {
        id: workOrder.id,
        title: `${workOrder.customer.name} ${workOrder.customer?.lastName}`,
        start: moment(workOrder?.startDate).format('YYYY-MM-DD') + 'T' + formatTime(workOrder.startTime) + ':00',
        end: moment(workOrder?.finalDate).format('YYYY-MM-DD') + 'T' + formatTime(workOrder.finalTime) + ':00',
        color: workOrder.employees[0]?.color,
        backgroundColor: workOrder.employees[0]?.color,
        technical_id: workOrder?.employees[0]?.id || 'B',
        folio: workOrder.folio,
        status: workOrder.status,
      };
    });
  }
  

  generateNotaVentaPDF( id: number,iva = false ) {
    return this.http.get<any>(`${baseUrl}/work-orders/nota-venta/${id}/${iva}`);
  }

  sendNotaVentaPDF( id: number, emails: string[], iva = false ) {
    return this.http.post<any>(`${baseUrl}/work-orders/send-nota-venta-email/${id}/${iva}`, { emails });
  }



  markAsValidated( id: string ) {
    return this.http.get<any>(`${baseUrl}/work-orders/change-validated/${id}`, );
  }
  updatePlanning(workOrderId: string, data: { start: string, end: string, technical_id: string }) {
    return this.http.put<any>(`${baseUrl}/work-orders/planning/${workOrderId}`, data);
  }
  reprogramWorkOrder(id: number, data: { startDate: string, startTime: string, finalDate: string, finalTime: string }): Observable<any> {
    return this.http.post<any>(`${baseUrl}/work-orders/reprogram/${id}`, data);
  }
}
