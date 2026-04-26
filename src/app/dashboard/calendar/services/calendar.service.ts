import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor( private http: HttpClient ) { }
  
  getGeneral(): Observable<any> {
    return this.http.get(`${ baseUrl }/diary/admon-general` )
  } 

  getByEmployeeId( employeeId: number ): Observable<any> {
    return this.http.get(`${ baseUrl }/diary/employee/${employeeId}` )
  } 

}
