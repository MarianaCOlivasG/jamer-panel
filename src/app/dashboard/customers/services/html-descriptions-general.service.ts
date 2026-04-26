import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class HtmlDescriptionsGeneralService {

  constructor( private http: HttpClient ) { }


  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/html-descriptions-general/create`, formData );
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/html-descriptions-general/update/${id}`, formData );
  }

  getAll() {
    return this.http.get<any>(`${baseUrl}/html-descriptions-general/all`);
  }

  remove( id: number ) {
    return this.http.delete<any>(`${baseUrl}/html-descriptions-general/remove/${ id }`);
  }


}
