import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class WorkToolsService {

  constructor( private http: HttpClient ) { }

  getAll(
      page: number = 1, 
      limit: number = 20, 
      isAvailable?: number,
      isActive?: number,
    ) {
    return this.http.get<any>(`${baseUrl}/work-tools/all?page=${page}&limit=${limit}&isAvailable=${isAvailable}&isActive=${isActive}`);
  }

  search(
    page: number = 1, 
    limit: number = 20, 
    queryString: string,
    isAvailable?: number,
    isActive?: number,
  ) {
    return this.http.get<any>(`${baseUrl}/work-tools/search/${queryString}?page=${page}&limit=${limit}&isAvailable=${isAvailable}&isActive=${isActive}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/work-tools/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/work-tools/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/work-tools/update/${id}`, formData);
  }

  disableOrEnable( id: number ) {
    return this.http.get(`${ baseUrl }/work-tools/disable-or-enable/${id}` )
  } 

  
  // Herramientas/equipos en almacen genera (en existencias)
  getAllInStok(
    page: number = 1, 
    limit: number = 20, 
  ) {
    return this.http.get<any>(`${baseUrl}/work-tools/all-in-stock?page=${page}&limit=${limit}`);
  }

  searchInStock(
    page: number = 1, 
    limit: number = 20, 
    queryString: string 
  ) {
    return this.http.get<any>(`${baseUrl}/work-tools/search-in-stock/${queryString}?page=${page}&limit=${limit}`);
  }


  // Almacénes
  getAllByStoreId(
    storeId: number,
    page: number = 1, 
    limit: number = 20, 
  ) {
    return this.http.get<any>(`${baseUrl}/work-tools/all-store/${storeId}?page=${page}&limit=${limit}`);
  }
  
  searchByStoreId(
    storeId: number,
    page: number = 1, 
    limit: number = 20, 
    queryString: string 
  ) {
    return this.http.get<any>(`${baseUrl}/work-tools/search-store/${storeId}/${queryString}?page=${page}&limit=${limit}`);
  }
  

}
    