import { HttpClient } from '@angular/common/http';
import { Injectable, Output } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Budget } from '../interfaces/budget.interface';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  public contractSelectedId$ = new BehaviorSubject<number | null>(null);

  getContractId(): Observable<number | null> {
      return this.contractSelectedId$.asObservable();
  }

  giveContractId(contractId: number) {
      this.contractSelectedId$.next(contractId);
  }
  
  public budgetSelectedId$ = new BehaviorSubject<number | null>(null);
  getBudgetId(): Observable<number | null> {
      return this.budgetSelectedId$.asObservable();
  }
  giveBudgetId(budgetId: number) {
      this.budgetSelectedId$.next(budgetId);
  }


  constructor( private http: HttpClient ) { }


  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/contracts/create`, formData );
  }

  update( id: string, formData: any ) {
    return this.http.put<any>(`${baseUrl}/contracts/update/${id}`, formData );
  }

  getAll(page: number = 1, limit: number = 20, customerId: number = 0, isOnlySale: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/contracts/all?page=${page}&limit=${limit}&customerId=${customerId}&isOnlySale=${isOnlySale}`);
  }

  search(page: number = 1, limit: number = 20, customerId: number = 0, queryString: string, isOnlySale: number = 0  ) {
    return this.http.get<any>(`${baseUrl}/contracts/search/${queryString}?page=${page}&limit=${limit}&customerId=${customerId}&isOnlySale=${isOnlySale}`);
  }

  getById( id: number ) {
    return this.http.get<any>(`${baseUrl}/contracts/details/${id}`);
  }

  sendEmail( id: string, emails: string[] ) {
    return this.http.post<any>(`${baseUrl}/contracts/send-email/${id}`, { emails });
  }

  getAllByCustomerIdWithoutPagination( customerId: number = 0, isOnlySale: number = 0  ) {
    return this.http.get<any>(`${baseUrl}/contracts/all-customer/${customerId}?isOnlySale=${isOnlySale}`);
  }


  getAllExpiring(page: number = 1, limit: number = 20, customerId: number = 0, isOnlySale: number = 0  ) {
    return this.http.get<any>(`${baseUrl}/contracts/all-expiring?page=${page}&limit=${limit}&customerId=${customerId}&isOnlySale=${isOnlySale}`);
  }

  searchExpiring(page: number = 1, limit: number = 20, customerId: number = 0, queryString: string, isOnlySale: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/contracts/search-expiring/${queryString}?page=${page}&limit=${limit}&customerId=${customerId}&isOnlySale=${isOnlySale}`);
  }

  getAllByBudgetId(page: number = 1, limit: number = 30, budgetId: number, isOnlySale: number = 0) {
    return this.http.get<any>(`${baseUrl}/contracts/by-budget/${budgetId}?page=${page}&limit=${limit}&isOnlySale=${isOnlySale}`);
  }
  renew( id: string, formData: any ) {
    return this.http.put<any>(`${baseUrl}/contracts/renew/${id}`, formData );
  }

  downloadPDF( id: number ) {
    return firstValueFrom(this.http.get<any>(`${baseUrl}/contracts/download-pdf/${id}`));
  }


}
