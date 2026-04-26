import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BudgetsService {

  public customerIdSelected: number = 0;

  constructor( private http: HttpClient ) { }
  reset(): void {
    this.customerIdSelected = 0;
    // this.currentBudgetId = '';
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/budgets/create`, formData );
  }

  update( id: string, formData: any ) {
    return this.http.put<any>(`${baseUrl}/budgets/update/${id}`, formData );
  }

  getAll(page: number = 1, limit: number = 20, customerId: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/budgets/all?page=${page}&limit=${limit}&customerId=${customerId}`);
  }

  search(page: number = 1, limit: number = 20, customerId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/budgets/search/${queryString}?page=${page}&limit=${limit}&customerId=${customerId}`);
  }

  getById( id: number ) {
    return this.http.get<any>(`${baseUrl}/budgets/details/${id}`);
  }

  sendEmail( id: string, emails: string[] , iva : boolean) {
    return this.http.post<any>(`${baseUrl}/budgets/send-email/${id}/${iva}`, { emails });
  }

  getAllByCustomerIdWithoutPagination( customerId: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/budgets/all-customer/${customerId}`);
  }

  downloadPDF( id: number, iva: boolean ) {
    return firstValueFrom(this.http.get<any>(`${baseUrl}/budgets/download-pdf/${id}/${iva}`));
  }

}
