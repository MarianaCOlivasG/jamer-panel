import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor( private http: HttpClient ) { }

  getAll(
      page: number = 1, 
      limit: number = 20, 
      workToolId?: number,
      isActive?: number,
    ) {
    return this.http.get<any>(`${baseUrl}/maintenance/all?page=${page}&limit=${limit}&workToolId=${workToolId}&isActive=${isActive}`);
  }

  search(
    page: number = 1, 
    limit: number = 20, 
    queryString: string,
    workToolId?: number,
    isActive?: number,
  ) {
    return this.http.get<any>(`${baseUrl}/maintenance/search/${queryString}?page=${page}&limit=${limit}&workToolId=${workToolId}&isActive=${isActive}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/maintenance/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/maintenance/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/maintenance/update/${id}`, formData);
  }

  remove( id: number ) {
    return this.http.delete(`${ baseUrl }/maintenance/remove/${id}` )
  } 
  

  setEntry( id: number ) {
    return this.http.get(`${ baseUrl }/maintenance/entry/${id}` )
  } 

}
    