import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { User } from 'src/app/auth/interfaces/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  public cashRegister;
  public viewCashRegister;
  public user!: User;
  public no: number = 0;
  public storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

  constructor( private router: Router,
               private socketsRouteService: SocketsRouteService,
               private authService: AuthService,
               private localStorageService: LocalStorageService,
               ) {
                this.user = authService.user;    
                this.cashRegister = ((this.storedPermissions?.find((p)=> p.page == "cash register")?.permissions ));
                this.viewCashRegister =  ((this.cashRegister as number >> 0)  % 2 == 1)? true : false;
              }
  ngOnInit(): void {

   this.socketsRouteService.notifications(
      localStorage.getItem('userName')).subscribe( (notifications: any) => {
        if (notifications) {

          this.no = notifications.no;
        } else {
          this.no = 0;
        }
      })
  }          

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('permissions');
    localStorage.removeItem('userName');

    this.router.navigate(['./auth/login']);
  }

}
