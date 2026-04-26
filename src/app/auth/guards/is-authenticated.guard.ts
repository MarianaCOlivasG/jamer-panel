import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class IsAuthenticatedGuard implements CanLoad {
  
  constructor( private router: Router,
               private authService: AuthService ){}


   canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | boolean {
    return this.authService.renew()
      .pipe(
        tap( isAuthenticated => {
          if (isAuthenticated) {
            this.router.navigate(['./employees']);
          }
        })      
    ); 

  }
  
}
