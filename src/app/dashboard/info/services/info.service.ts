import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.apiUrl;


@Injectable({
  providedIn: 'root'
})
export class InfoService {


  public info: any;

  constructor( private http: HttpClient ) { }

  getInfo() {
    return this.http.get<any>(`${baseUrl}/general/info`)
    .pipe(
      tap( (resp: any) => {
        this.info = resp.info;
      })
    );
  }

  update( id: number, formData: any ) {
    return this.http.put<any>(`${baseUrl}/general/info/${id}`, formData );
  }


  uploadLogo( file: File ) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name );
    return this.http.put<any>(`${baseUrl}/uploads/logo`, formData );
  }


}
