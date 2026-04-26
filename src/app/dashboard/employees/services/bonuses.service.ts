import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';


const baseUrl = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class BonusesService {

  constructor( private http: HttpClient ) { }


  getAll(page: number = 1, limit: number = 20, employeeId: number = 0, isValidated: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/bonuses/all?page=${page}&limit=${limit}&employeeId=${employeeId}&isValidated=${isValidated}`);
  }

  search(page: number = 1, limit: number = 20, queryString: string, employeeId: number = 0, isValidated: number = 0 ) {
    return this.http.get<any>(`${baseUrl}/bonuses/search/${queryString}?page=${page}&limit=${limit}&employeeId=${employeeId}&isValidated=${isValidated}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${baseUrl}/bonuses/details/${id}`);
  }

  getAllWithoutPagination() {
    return this.http.get<any>(`${baseUrl}/bonuses/all/none`);
  }

  confirmById( uid: string, id: number, formData: any ) {
    return this.http.post<any>(`${baseUrl}/bonuses/confirm/${uid}/${id}`, formData );
  }

  deleteById(id: number) {
    return this.http.delete<any>(`${baseUrl}/bonuses/remove/${id}`);
  }

}
