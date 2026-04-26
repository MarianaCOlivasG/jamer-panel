import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor( private http: HttpClient ) { }

  getAll(page: number = 1, limit: number = 20, typeId: number ) {
    return this.http.get<any>(`${baseUrl}/suppliers/all?page=${page}&limit=${limit}&type=${typeId}`);
  }

  search(page: number = 1, limit: number = 20, typeId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/suppliers/search/${queryString}?page=${page}&limit=${limit}&type=${typeId}`);
  }

  getAllTypes() {
    return this.http.get<any>(`${baseUrl}/suppliers/types`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/suppliers/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/suppliers/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/suppliers/update/${id}`, formData);
  }

  disableOrEnable( id: number ): Observable<any>{
    return this.http.get(`${ baseUrl }/suppliers/disable-or-enable/${id}` )
  } 

  getWithoutPagination( ) {
    return this.http.get<any>(`${baseUrl}/suppliers/all/none`);
  }

}
