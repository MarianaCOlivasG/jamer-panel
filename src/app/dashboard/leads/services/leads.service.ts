import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class LeadsService {

  constructor( private http: HttpClient ) { }

  getAll(page: number = 1, limit: number = 20) {
    return this.http.get<any>(`${baseUrl}/leads/all?page=${page}&limit=${limit}`);
  }

  search(page: number = 1, limit: number = 20, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/leads/search/${queryString}?page=${page}&limit=${limit}`);
  }

  converToCustomer( id: number, formData: any ) {
    return this.http.post<any>(`${baseUrl}/leads//convert-customer/${id}`, formData);
  }

}