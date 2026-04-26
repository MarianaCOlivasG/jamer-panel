import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DiaryEventsService {

  constructor( private http: HttpClient ) { }

  getAll(): Observable<any[]>{
    return this.http.get(`${ baseUrl }/diary-events/all?limit=20&page=1` )
      .pipe( map( (resp: any) => {
        return this.transformEvents(resp.diaryEvents)
      }))
  } 

  getAllByCalendarId( calendarId: number ): Observable<any[]>{
    return this.http.get(`${ baseUrl }/diary-events/all-diary/${calendarId}` )
      .pipe( map( (resp: any) => {
        console.log(resp.events)
        return this.transformEvents(resp.events)
      }))
  } 


  private transformEvents( diaryEvents: any[] ) {
    return diaryEvents.map( event => {
      return {
        id: event.id,
        title: event.title,
        start: event?.startDate + `${event.startTime ? 'T'+event.startTime : ''}`,
        end: event?.finalDate + `${event.finalTime ? 'T'+event.finalTime : ''}`,
        color: event.diaryEnventType.color
      };
    })
  }


  updateTimes( id: number | string, formData: any ) {
    return this.http.put<any>(`${baseUrl}/diary-events/update-times/${id}`, formData);
  }

  getById( id: number ): Observable<any> {
    return this.http.get(`${ baseUrl }/diary-events/details/${id}` )
  } 

  getTypes(): Observable<any> {
    return this.http.get(`${ baseUrl }/diary-events/types` )
  } 

  create( formData: any ) {
    return this.http.post<any>(`${baseUrl}/diary-events/create`, formData);
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/diary-events/update/${id}`, formData);
  }

}
