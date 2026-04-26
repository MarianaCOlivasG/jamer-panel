import { Component } from '@angular/core';
import { Employee } from '../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from '../../services/employees.service';
import { switchMap } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment.development';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent {
  public storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

  public employee!: Employee; 
  public employeeSelected!: Employee;

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;

  public modalSelected: 'image' | 'files' = 'files';


  constructor( private activatedRoute: ActivatedRoute,
               private employeesService: EmployeesService,
               public modalService: ModalService,
               public authService: AuthService,
              private location: Location,

               private localStorageService: LocalStorageService,
               private router: Router,
               ){}
public editUser: any;
  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.employeesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.employee = resp.employee;
        console.log(this.employee)
        this.isLoading = false;
      });
      const employees = (this.storedPermissions?.find((p)=> p.page == "employees")?.permissions );
      ((employees as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
       this.editUser =  ((employees as number >> 2 ) % 2 == 1)? true :false; 
  
    }


  openModal( employee: Employee, modalSelected: 'image' | 'files' ) {
    if ( this.authService.user.role.key != 'admin' ) return;
    this.employeeSelected = employee;
    this.modalSelected = modalSelected;
    this.modalService.openModal();
  }


  changePicture( newPicture: string) {
    this.employee.picture = newPicture;
    if ( this.employee.user.uid == this.authService.user.uid ) {
      this.authService.user.picture = newPicture;
    }
  }


  goToBack() {
    this.location.back()
  }



}
