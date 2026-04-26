import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CustomersService {


  public leadTemp: {
    name: string;
    email: string;
    phone: string;
  } | null = null;

  constructor( private http: HttpClient ) { }


  setLeadTemp( leadTemp: {
    name: string;
    email: string;
    phone: string;
  } |null ) {
    this.leadTemp = leadTemp;
  }


  getAll(page: number = 1, limit: number = 20, typeId: number ) {
    return this.http.get<any>(`${baseUrl}/customers/all?page=${page}&limit=${limit}&type=${typeId}`);
  }

  getAllWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/customers/all-none`);
  }

  search(page: number = 1, limit: number = 20, typeId: number = 0, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/customers/search/${queryString}?page=${page}&limit=${limit}&type=${typeId}`);
  } 


  getAllTypes() {
    return this.http.get<any>(`${baseUrl}/customers/types`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/customers/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/customers/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/customers/update/${id}`, formData);
  }

  createAddressByCustomerId( customerId: number, formData: any ) {
    return this.http.post<any>(`${baseUrl}/customers/addresses/create/${customerId}`, formData);
  }

  updateAddress( addressId: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/customers/addresses/update/${addressId}`, formData);
  }


  getAllAddressByCustomerId(page: number = 1, limit: number = 20, customerId: number ) {
    return this.http.get<any>(`${baseUrl}/customers/addresses/all/${customerId}?page=${page}&limit=${limit}`);
  }

  getAllAddressByCustomerIdWithoutPagination(customerId: number ) {
    return this.http.get<any>(`${baseUrl}/customers/addresses/all-none/${customerId}`);
  }


  searchAddress(page: number = 1, limit: number = 20, customerId: number, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/customers/addresses/search/${customerId}/${queryString}?page=${page}&limit=${limit}`);
  }

  // Evíar estado de cuenta
  sendEmail( id: string, emails: string[], facturasIds?: number[] ) {
    return this.http.post<any>(`${baseUrl}/customers/send/estado-de-cuenta/${id}`, { emails, facturasIds });
  }

  downloadEmail( id: string | number ) {
    return this.http.get<any>(`${baseUrl}/customers/estado-de-cuenta/${id}`);
  }

  getFacturas( id: string | number ) {
    return this.http.get<any>(`${baseUrl}/customers/facturas/${id}`);
  }


  deleteFactura( facturaId: string | number ) {
    return this.http.delete<any>(`${baseUrl}/customers/facturas/${facturaId}`);
  }

  getContactsByCustomerId(customerId: number ) {
    return this.http.get<any>(`${baseUrl}/contacts/all/customer/${customerId}`);
  }

}
