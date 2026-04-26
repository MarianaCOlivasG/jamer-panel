import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;


@Injectable({
  providedIn: 'root'
})
export class WorkstationService {

  constructor( private http: HttpClient ) { }

  getAll() {
    return this.http.get<any>(`${baseUrl}/work-stations/all`);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/work-stations/update/${ id }`, formData);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/work-stations/create`, formData);
  }

  remove( id: number ) {
    return this.http.delete<any>(`${baseUrl}/work-stations/remove/${ id }`);
  }
  
}
