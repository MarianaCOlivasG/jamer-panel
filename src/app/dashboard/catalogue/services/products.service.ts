import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  
  constructor( private http: HttpClient ) { }


  getTypes() {
    return this.http.get<any>(`${baseUrl}/products/all/types`);
  }

  getAll(
      page: number = 1, 
      limit: number = 20, 
      businessLineId: number = 0,
      businessFamilyId: number = 0,
      supplierId: number = 0,
      productTypeId: number = 0,
      status: number = 0,
    ) {
    return this.http.get<any>(`${baseUrl}/products/all?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&supplierId=${supplierId}&productTypeId=${productTypeId}&status=${status}`);
  }


  // Obtener todos los productos sin paginación isActive: true, productTypeId: 1
  getAllWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/products/all-none`);
  }

  search(
    page: number = 1, 
    limit: number = 20, 
    businessLineId: number = 0,
    businessFamilyId: number = 0,
    supplierId: number = 0,
    productTypeId: number = 0,
    status: number = 0,
    queryString: string 
  ) {
    return this.http.get<any>(`${baseUrl}/products/search/${queryString}?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&supplierId=${supplierId}&productTypeId=${productTypeId}&status=${status}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/products/details/${id}`);
  }

  searchAutoComplete(
    page: number = 1, 
    limit: number = 20, 
    queryString: string 
  ) {
    return this.http.get<any>(`${baseUrl}/products/search/${queryString}?page=${page}&limit=${limit}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/products/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/products/update/${id}`, formData);
  }

  disableOrEnable( id: number ) {
    return this.http.get(`${ baseUrl }/products/disable-or-enable/${id}` )
  } 


  // STORES
  getAllByStoreId(
    storeId: number,
    page: number = 1, 
    limit: number = 20, 
    businessLineId: number = 0,
    businessFamilyId: number = 0,
    productTypeId: number = 0,
  ) {
    return this.http.get<any>(`${baseUrl}/products/all-store/${storeId}?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&productTypeId=${productTypeId}`);
  }

  searchByStoreId(
    storeId: number,
    page: number = 1, 
    limit: number = 20, 
    businessLineId: number = 0,
    businessFamilyId: number = 0,
    productTypeId: number = 0,
    queryString: string 
  ) {
    return this.http.get<any>(`${baseUrl}/products/search-store/${storeId}/${queryString}?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&productTypeId=${productTypeId}`);
  }
  // END STORES



  // BUDGETS
  getAllOnSale(
    page: number = 1, 
    limit: number = 20, 
    businessLineId: number = 0,
    businessFamilyId: number = 0,
    productTypeId: number = 0,
  ) {
    return this.http.get<any>(`${baseUrl}/products/all-on-sale?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&productTypeId=${productTypeId}`)
  }
  searchOnSale(
    page: number = 1, 
    limit: number = 20, 
    queryString: string, 
    businessLineId: number = 0,
    businessFamilyId: number = 0,
    productTypeId: number = 0,
  ) {
    return this.http.get<any>(`${baseUrl}/products/search-on-sale/${queryString}?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&productTypeId=${productTypeId}`);
  }
  // END BUDGETS
  



  // Productos en almacen general (en existencias)
  getAllInStok(
    page: number = 1, 
    limit: number = 20, 
    businessLineId: number = 0,
    businessFamilyId: number = 0,
    productTypeId: number = 0,
  ) {
    return this.http.get<any>(`${baseUrl}/products/all-in-stock?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&productTypeId=${productTypeId}`);
  }

  searchInStock(
    page: number = 1, 
    limit: number = 20, 
    businessLineId: number = 0,
    businessFamilyId: number = 0,
    productTypeId: number = 0,
    queryString: string 
  ) {
    return this.http.get<any>(`${baseUrl}/products/search-in-stock/${queryString}?page=${page}&limit=${limit}&businessLineId=${businessLineId}&businessFamilyId=${businessFamilyId}&productTypeId=${productTypeId}`);
  }


  countInStock() {
    return this.http.get<any>(`${baseUrl}/products/count-in-stock`);
  }

  
}
    