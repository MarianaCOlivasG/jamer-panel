import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';


const baseUrl = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class IncidencesService {

  constructor( private http: HttpClient ) { }


  getAll(page: number = 1, limit: number = 20, employeeId: number = 0, isValidated: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/incidences/all?page=${page}&limit=${limit}&employeeId=${employeeId}&isValidated=${isValidated}`);
  }

  search(page: number = 1, limit: number = 20, queryString: string, employeeId: number = 0, isValidated: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/incidences/search/${queryString}?page=${page}&limit=${limit}&employeeId=${employeeId}&isValidated=${isValidated}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/incidences/details/${id}`);
  }

  getAllWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/incidences/all/none`);
  }

  confirmById( uid: string, id: number, formData: any ) {
    return this.http.post<any>(`${baseUrl}/incidences/confirm/${uid}/${id}`, formData );
  }

  deleteById(id: number) {
    return this.http.delete<any>(`${baseUrl}/incidences/remove/${id}`);
  }

}
