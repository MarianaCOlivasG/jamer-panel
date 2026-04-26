import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const token = localStorage.getItem('accessToken') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ token }`
    });
 
    const requestClone = request.clone({
      headers
    });
    
    return next.handle(requestClone);
  }


}