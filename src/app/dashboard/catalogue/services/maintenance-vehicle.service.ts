import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class MaintenanceVehicleService {

  constructor( private http: HttpClient ) { }

  getAll(
      page: number = 1, 
      limit: number = 20, 
      vehicleId?: number,
      isActive?: number,
    ) {
    return this.http.get<any>(`${baseUrl}/maintenances-vehicles/all?page=${page}&limit=${limit}&vehicleId=${vehicleId}&isActive=${isActive}`);
  }

  search(
    page: number = 1, 
    limit: number = 20, 
    queryString: string,
    vehicleId?: number,
    isActive?: number,
  ) {
    return this.http.get<any>(`${baseUrl}/maintenances-vehicles/search/${queryString}?page=${page}&limit=${limit}&vehicleId=${vehicleId}&isActive=${isActive}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/maintenances-vehicles/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/maintenances-vehicles/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/maintenances-vehicles/update/${id}`, formData);
  }

  remove( id: number ) {
    return this.http.delete(`${ baseUrl }/maintenances-vehicles/remove/${id}` )
  } 
  

  setEntry( id: number ) {
    return this.http.get(`${ baseUrl }/maintenances-vehicles/entry/${id}` )
  } 

}
    