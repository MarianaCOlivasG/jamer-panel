import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PurchasesService { 

  constructor( private http: HttpClient ) { }


  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/purchases/create`, formData );
  }

  update( id: string, formData: any ) {
    return this.http.put<any>(`${baseUrl}/purchases/update/${id}`, formData );
  }

  getAllWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/purchases/all-none`);
  }

  getAll(page: number = 1, limit: number = 20, supplierId: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/purchases/all?page=${page}&limit=${limit}&supplierId=${supplierId}`);
  }

  search(page: number = 1, limit: number = 20, supplierId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/purchases/search/${queryString}?page=${page}&limit=${limit}&supplierId=${supplierId}`);
  }

  getById( id: number ) {
    return this.http.get<any>(`${baseUrl}/purchases/details/${id}`);
  }

  sendEmail( id: string, emails: string[] ) {
    return this.http.post<any>(`${baseUrl}/purchases/send-email/${id}`, { emails });
  }


  downloadPDF( id: number ) {
    return firstValueFrom(this.http.get<any>(`${baseUrl}/purchases/download-pdf/${id}`));
  }

}
