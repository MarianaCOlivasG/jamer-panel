import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';


const baseUrl = environment.apiUrl + '/sockets';


@Injectable({
    providedIn: 'root'
  })
export class SocketsRouteService {
    constructor( private http: HttpClient ) { }
    createIncidence(formData: any) {
        return this.http.post<any>(`${baseUrl}/incidences`, { formData });
    }
    
      updateIncidence(id: number, formData: any) {
        return this.http.put<any>(`${baseUrl}/incidences/${id}`, { formData });
    }

    markAsReadIncidence( incidenceId: number ) {
        return this.http.put<any>(`${baseUrl}/incidences/${incidenceId}/read`, {});
    }
    
    markAsConfirmIncidence( incidenceId: number ) {
        return this.http.put<any>(`${baseUrl}/incidences/${incidenceId}/confirm`, {});
    }
    createBonus(formData: any) {
        return this.http.post<any>(`${baseUrl}/bonuses`, { formData });
    }
    updateBonus(id: number, formData: any) {
        return this.http.put<any>(`${baseUrl}/bonuses/${id}`, { formData });
    }
    markAsReadBonus( bonusId: number ) {
        return this.http.put<any>(`${baseUrl}/bonuses/${bonusId}/read`, {});
    }

    markAsConfirmBonus( bonusId: number ) {
        return this.http.put<any>(`${baseUrl}/bonuses/${bonusId}/confirm`, {});
    }

    createworkOrder(formData: any) {
        return this.http.post<any>(`${baseUrl}/work-orders`, { formData });
    }

    createWorkOrdeWhitoutContract(formData: any) {
        return this.http.post<any>(`${baseUrl}/work-orders/without-contract`, { formData });
    }

    assignemployeesToWorkOrder(formData: any) {
        return this.http.put<any>(`${baseUrl}/work-orders/assign/`, {formData });
    }


    
    deleteWorkOrder(id: any) {
        
        return this.http.delete<any>(`${baseUrl}/work-orders/${id}`,{});
    }

    maskAsReadWorkOrder(formData: any) {
        return this.http.put<any>(`${baseUrl}/work-orders/${formData.workOrderId}/read`, {formData});
    }


    cancelWorkOrder(formData:any) {
        return this.http.put<any>(`${baseUrl}/work-orders/${formData.id}/cancel`, {formData});
    }

    updateWorkOrder(formData: any) {
        return this.http.put<any>(`${baseUrl}/work-orders/${formData.id}`, { formData });
    }
    updateWorkOrderWithoutContract(formData: any) {
        return this.http.put<any>(`${baseUrl}/work-orders/${formData.id}/without-contract`, { formData });
    }
   

    addWorkTools(formData: any) {
        return this.http.post<any>(`${baseUrl}/work-tools/add`, { formData });
    }
    notifications(name: any) {
            
        return this.http.post<any>(`${baseUrl}/notifications/total/${name}`, {
        });
    }
    
}