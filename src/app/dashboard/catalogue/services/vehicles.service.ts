import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {

  constructor( private http: HttpClient ) { }

  getAll(
      page: number = 1, 
      limit: number = 20, 
      isAvailable?: number,
      isActive?: number,
    ) {
    return this.http.get<any>(`${baseUrl}/vehicles/all?page=${page}&limit=${limit}&isAvailable=${isAvailable}&isActive=${1}`);
  }

  search(
    page: number = 1, 
    limit: number = 20, 
    queryString: string,
    isAvailable?: number,
    isActive?: number,
  ) {
    return this.http.get<any>(`${baseUrl}/vehicles/search/${queryString}?page=${page}&limit=${limit}&isAvailable=${isAvailable}&isActive=${1}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/vehicles/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/vehicles/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/vehicles/update/${id}`, formData);
  }

  disableOrEnable( id: number ) {
    return this.http.get(`${ baseUrl }/vehicles/disable-or-enable/${id}` )
  } 

  assignTo( id: number, employeeId: number ) {
    return this.http.get(`${ baseUrl }/vehicles/assign-to/${id}/employee/${employeeId}`);
  } 


}
    