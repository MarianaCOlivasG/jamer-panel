import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor( private http: HttpClient ) { }


  getAll(page: number = 1, limit: number = 20, purchaseId: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/payments/all?page=${page}&limit=${limit}&purchaseId=${purchaseId}`);
  }

  search(page: number = 1, limit: number = 20, purchaseId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/payments/search/${queryString}?page=${page}&limit=${limit}&purchaseId=${purchaseId}`);
  }

  getBalance(page: number = 1, limit: number = 20, supplierId: number = 0, year: any ) {
    return this.http.get<any>(`${baseUrl}/balances/all?page=${page}&limit=${limit}&supplierId=${supplierId}&year=${year}`);
  }

  addPaymentsToPurchaseId( purchaseId: number, data: any ) {
    return this.http.put<any>(`${baseUrl}/payments/add/${purchaseId}`, data );
  }

  addPaymentsToSupplierId( supplierId: number, data: any ) {
    return this.http.put<any>(`${baseUrl}/payments/add-supplier/${supplierId}`, data );
  }

  exportToExcel(supplierId: number, fileName: string ) {
    return this.http.get<any>(`${baseUrl}/balances/export?supplierId=${supplierId}&fileName=${fileName}`);
  }



}
