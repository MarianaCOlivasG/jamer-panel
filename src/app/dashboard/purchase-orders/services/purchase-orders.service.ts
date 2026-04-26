import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService {

  constructor( private http: HttpClient ) { }


  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/purchase_orders/create`, formData );
  }

  update( id: string, formData: any ) {
    return this.http.put<any>(`${baseUrl}/purchase_orders/update/${id}`, formData );
  }

  getAll(page: number = 1, limit: number = 20, supplierId: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/purchase_orders/all?page=${page}&limit=${limit}&supplierId=${supplierId}`);
  }

  search(page: number = 1, limit: number = 20, supplierId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/purchase_orders/search/${queryString}?page=${page}&limit=${limit}&supplierId=${supplierId}`);
  }

  getById( id: number ) {
    return this.http.get<any>(`${baseUrl}/purchase_orders/details/${id}`);
  }

  sendEmail( id: string, emails: string[] ) {
    return this.http.post<any>(`${baseUrl}/purchase_orders/send-email/${id}`, { emails });
  }

  downloadPDF( id: number ) {
    return firstValueFrom(this.http.get<any>(`${baseUrl}/purchase_orders/download-pdf/${id}`));
  }


}
