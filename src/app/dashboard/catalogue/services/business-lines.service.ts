import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BusinessLinesService {

  constructor( private http: HttpClient ) { }

  getAll(page: number = 1, limit: number = 20 ) {
    return this.http.get<any>(`${baseUrl}/business-lines/all?page=${page}&limit=${limit}`);
  }

  search(page: number = 1, limit: number = 20, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/business-lines/search/${queryString}?page=${page}&limit=${limit}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/business-lines/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/business-lines/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/business-lines/update/${id}`, formData);
  }

  getAllWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/business-lines/all/none`);
  }

}
