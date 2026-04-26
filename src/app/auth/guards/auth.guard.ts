import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, tap } from 'rxjs';
import { InfoService } from 'src/app/dashboard/info/services/info.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor( private router: Router,
               private authService: AuthService,
               private infoService: InfoService ){}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.authService.renew()
      .pipe(
        tap( isAuthenticated => {
          if (!isAuthenticated) {
            this.router.navigate(['./auth/login']);
          } else {
            this.infoService.getInfo().subscribe()
        
          }
        })      
    ); 
  }


}
