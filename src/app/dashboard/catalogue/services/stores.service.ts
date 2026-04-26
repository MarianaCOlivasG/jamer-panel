import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  
  constructor( private http: HttpClient ) { }

  getAll(page: number = 1, limit: number = 20, employeeId: number ) {
    return this.http.get<any>(`${baseUrl}/stores/all?page=${page}&limit=${limit}&employeeId=${employeeId}`);
  }

  search(page: number = 1, limit: number = 20, employeeId: number, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/stores/search/${queryString}?page=${page}&limit=${limit}&employeeId=${employeeId}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/stores/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/stores/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/stores/update/${id}`, formData);
  }

  disableOrEnable( id: number ): Observable<any>{
    return this.http.get(`${ baseUrl }/stores/disable-or-enable/${id}` )
  } 

  addProductToStore( storeId: number, formData: any ) {
    return this.http.post<any>(`${baseUrl}/stores/add-products/${storeId}`, formData);
  }

  removeProductToStore( productStoreId: number) {
    return this.http.delete<any>(`${baseUrl}/stores/remove-product/${productStoreId}`);
  }

  updateAmountProducts( storeId: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/stores/update-amout-products/${storeId}`, formData);
  }

  removeWorkToolsToStore( workToolStoreId: number) {
    return this.http.delete<any>(`${baseUrl}/stores/remove-work-tools/${workToolStoreId}`);
  }

  assingProductSpent( productStoreId: number) {
    return this.http.put<any>(`${baseUrl}/stores/assing-spent`, {
      productStoreId
    });
  }
}
  