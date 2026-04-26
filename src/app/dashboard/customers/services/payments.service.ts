import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CustomersPaymentsService {

  constructor( private http: HttpClient ) { }

  getAll(page: number = 1, limit: number = 20, workOrderId: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/customers-payments/all?page=${page}&limit=${limit}&workOrderId=${workOrderId}`);
  }

  search(page: number = 1, limit: number = 20, workOrderId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/customers-payments/search/${queryString}?page=${page}&limit=${limit}&workOrderId=${workOrderId}`);
  }

  addPaymentsToCustomer( data: any ) {
    return this.http.put<any>(`${baseUrl}/customers-payments/add-customer`, data );
  }

  getBalance(page: number = 1, limit: number = 20, year: any, documentType: 'R' | 'F', customerId: number = 0) {
    return this.http.get<any>(`${baseUrl}/customers-balances/all?page=${page}&limit=${limit}&year=${year}&documentType=${documentType}&customerId=${customerId}`);
  }

  exportToExcel(year: any, documentType: 'R' | 'F', customerId: number = 0, fileName: string ) {
    return this.http.get<any>(`${baseUrl}/customers-balances/export?year=${year}&documentType=${documentType}&customerId=${customerId}&fileName=${fileName}`);
  }

  getBalanceSales(page: number = 1, limit: number = 20, year: any, documentType: 'R' | 'F', customerId: number = 0) {
    return this.http.get<any>(`${baseUrl}/customers-balances-sales/all?page=${page}&limit=${limit}&year=${year}&documentType=${documentType}&customerId=${customerId}`);
  }

  exportToExcelSales(year: any, documentType: 'R' | 'F', customerId: number = 0, fileName: string ) {
    return this.http.get<any>(`${baseUrl}/customers-balances-sales/export?year=${year}&documentType=${documentType}&customerId=${customerId}&fileName=${fileName}`);
  }

  getPaysCustomersWorkOrder( workOrderId: number  ) {
    return this.http.get<any>(`${baseUrl}/customers-balances/pays-work-order/${workOrderId}`);
  }

  getCobranza( year: any, documentType: 'R' | 'F') {
    return this.http.get<any>(`${baseUrl}/cobranza/all?year=${year}&documentType=${documentType}`);
  }

  addPayment( data: any ) {
    return this.http.post<any>(`${baseUrl}/cobranza/add-payment`, data );
  }

  addPaymentSale( data: any ) {
    return this.http.post<any>(`${baseUrl}/cobranza/add-payment-sale`, data );
  }

  getXCobrar(page: number = 1, limit: number = 20, year: any, documentType: 'R' | 'F', customerId: number = 0) {
    return this.http.get<any>(`${baseUrl}/customers-balances/all-x-cobrar?page=${page}&limit=${limit}&year=${year}&documentType=${documentType}&customerId=${customerId}`);
  }

  updatePayment(id: number, data: any) {
    return this.http.put<any>(`${baseUrl}/cobranza/update-payment/${id}`, data);
  }
  deletePayment(id: number) {
    return this.http.delete<any>(`${baseUrl}/cobranza/delete-payment/${id}`);
  }
}