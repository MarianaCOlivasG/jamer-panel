import { Injectable } from '@angular/core';
import { LoginForm } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { LocalStorageService } from './local-storage.service';
import { Permission } from '../interfaces/Permission.interface';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user!: User;

  constructor( private http: HttpClient,private localStorageService: LocalStorageService ) { }

  login( formData: LoginForm ): Observable<any>{
    return this.http.post(`${ baseUrl }/auth/login/1`, formData )
      .pipe(
        tap( (resp: any) => {
          localStorage.setItem('accessToken', resp.accessToken );
          localStorage.setItem('userName',formData.userName)
          this.localStorageService.setItem<Permission[]>('permissions',resp.permissions);
      
        })
      );
  } 


  isAdmin() {
    return this.user.role.key == 'admin'
  }

  renew() {
    return this.http.get(`${ baseUrl }/auth/renew/1` )
      .pipe(
        tap( (resp: any) => {
          this.user = resp.userAuthenticated;
          localStorage.setItem('accessToken', resp.accessToken );
        }),
        map( _ => true ),
        catchError( _ => of(false) )
      );
  }


  disableOrEnable( uid: string ): Observable<any>{
    return this.http.get(`${ baseUrl }/auth/disable-or-enable/${uid}` )
  } 


  resetPassword( uid: string, formData: { password: string }): Observable<any>{
    return this.http.post(`${ baseUrl }/auth/reset-password/${uid}`, formData )
  } 


  resetCredentials( uid: string, formData: any ): Observable<any>{
    return this.http.post(`${ baseUrl }/auth/reset-credentials/${uid}`, formData )
  } 


  create( formData: any ) {
    return this.http.post(`${ baseUrl }/auth/register`, formData )
  }


  getAllRoles(): Observable<any>{
    return this.http.get(`${ baseUrl }/auth/roles` )
  } 

  getAllAccessTypes(): Observable<any>{
    return this.http.get(`${ baseUrl }/auth/access-types` )
  } 

}
