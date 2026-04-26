import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BusinessFamiliesService {

  constructor( private http: HttpClient ) { }

  getAll(page: number = 1, limit: number = 20, businessLineId: number ) {
    return this.http.get<any>(`${baseUrl}/business-families/all?page=${page}&limit=${limit}&businessLineId=${businessLineId}`);
  }

  getAllWithoutPagination( businessLineId: number ) {
    return this.http.get<any>(`${baseUrl}/business-families/all/business-line/${businessLineId}`);
  }

  search(page: number = 1, limit: number = 20, businessLineId: number, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/business-families/search/${queryString}?page=${page}&limit=${limit}&businessLineId=${businessLineId}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/business-families/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/business-families/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/business-families/update/${id}`, formData);
  }

}
