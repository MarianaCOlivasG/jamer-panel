import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {

  constructor( private http: HttpClient ) { }


  getAll(page: number = 1, limit: number = 20, employeeId: number = 0, isValidated: number = 2, movement: string = '' ) {
    return this.http.get<any>(`${baseUrl}/cash-register/all?page=${page}&limit=${limit}&employeeId=${employeeId}&isValidated=${isValidated}&movement=${movement}`);
  }
  
  createToWorkOrder( data: any ) {
    return this.http.post<any>(`${baseUrl}/cash-register/add-work-order`, data );
  }

  createToSale( data: any ) {
    return this.http.post<any>(`${baseUrl}/cash-register/add-sale`, data );
  }

  createToOther( data: any ) {
    return this.http.post<any>(`${baseUrl}/cash-register/add-other`, data );
  }

  update( data: any ) {
    return this.http.put<any>(`${baseUrl}/cash-register/update`, data );
  }


  getDetails( cashRegisterId: number ) {
    return this.http.get<any>(`${baseUrl}/cash-register/details/${cashRegisterId}`);
  }

  validate( cashRegisterId: number ) {
    return this.http.get<any>(`${baseUrl}/cash-register/validate/${cashRegisterId}`);
  }

}
