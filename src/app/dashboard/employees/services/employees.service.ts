import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Employee } from '../interfaces';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor( private http: HttpClient ) { }


  getAll(page: number = 1, limit: number = 20) {
    return this.http.get<any>(`${baseUrl}/employees/all?page=${page}&limit=${limit}`);
  }

  search(page: number = 1, limit: number = 20, queryString: string ) {
    return this.http.get<any>(`${baseUrl}/employees/search/${queryString}?page=${page}&limit=${limit}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/employees/details/${id}`);
  }

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/employees/create-only`, formData);
  }

  createWithUser( formData: any ) {
    return this.http.post<any>(`${baseUrl}/employees/create-with-user`, formData);
  }

  permissions ( formData:any){
    return this.http.post<any>(`${baseUrl}/auth/permissions`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/employees/update/${id}`, formData);
  }

  getAllWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/employees/all/none`);
  }


  getTechnicalsWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/employees/all/technicals-none`)
      .pipe(
        map( ( resp ) => {
          return this.transformData( resp.employees )
        })
      );
  }


  private transformData( employees: Employee[] ): MultiSelectData[] {
    return employees.map( employee => {
      return { id: employee.id, itemName: `${employee.name} ${employee.lastName} ` }
    })
  }

  getTechnicalsWithoutPaginationNoMultiSelect() {
    return this.http.get<any>(`${baseUrl}/employees/all/technicals-none`)
  }

}
