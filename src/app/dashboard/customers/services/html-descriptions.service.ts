import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class HtmlDescriptionsService {

  constructor( private http: HttpClient ) { }


  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/html-descriptions/create`, formData );
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/html-descriptions/update/${id}`, formData );
  }

  getAllByProductId( productId: number ) {
    return this.http.get<any>(`${baseUrl}/html-descriptions/all/product/${productId}`);
  }

  remove( id: number ) {
    return this.http.delete<any>(`${baseUrl}/html-descriptions/remove/${ id }`);
  }
  
}
