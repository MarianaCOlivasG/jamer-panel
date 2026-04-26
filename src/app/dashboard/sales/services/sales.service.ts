import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor( private http: HttpClient ) { }


  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/sales/create`, formData );
  }

  update( id: string, formData: any ) {
    return this.http.put<any>(`${baseUrl}/sales/update/${id}`, formData );
  }

  getAllWithoutPagination(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${baseUrl}/sales/all-none`));
  }

  getAll(page: number = 1, limit: number = 20, customerId: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/sales/all?page=${page}&limit=${limit}&customerId=${customerId}`);
  }

  search(page: number = 1, limit: number = 20, customerId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/sales/search/${queryString}?page=${page}&limit=${limit}&customerId=${customerId}`);
  }

  getById( id: number ) {
    return this.http.get<any>(`${baseUrl}/sales/details/${id}`);
  }

  sendEmail( id: string, emails: string[] ) {
    return this.http.post<any>(`${baseUrl}/sales/send-email/${id}`, { emails });
  }


}
