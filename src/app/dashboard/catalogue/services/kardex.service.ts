import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class KardexService {

  constructor( private http: HttpClient ) { }

  getAll(
      page: number = 1, 
      limit: number = 20, 
      productId?: number,
    ) {
    return this.http.get<any>(`${baseUrl}/kardex/all?page=${page}&limit=${limit}&productId=${productId}`);
  }

  search(
    page: number = 1, 
    limit: number = 20, 
    queryString: string,
    productId?: number,
  ) {
    return this.http.get<any>(`${baseUrl}/kardex/search/${queryString}?page=${page}&limit=${limit}&productId=${productId}`);
  }

 

}
    