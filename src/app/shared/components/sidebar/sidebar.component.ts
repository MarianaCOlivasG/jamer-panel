import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/auth/interfaces';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { InfoService } from 'src/app/dashboard/info/services/info.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  public user!: User;
  public storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
  public file!: File | null;
  public fileTemp!: string | ArrayBuffer | null;

  public validTypes : string[] = ['image/jpg', 'image/jpeg','image/png', 'image/gif'];


  public isLoading: boolean = false;

  public employees;
  public viewEmployees;

  public incidences;
  public viewIncidences;

  public bonuses;
  public viewBonuses;

  public workStation;
  public viewWorkStation;

  public customer;
  public viewCustomer;

  public budgets;
  public viewBudgets;

  public contracts;
  public viewContracts;

  public sale;
  public viewsale;

  public template;
  public viewTemplate;

  public calendarType;
  public viewCalendarType;

  public store;
  public viewStore;


  public leads;
  public viewLeads;

  public business;
  public viewBusiness;


  public kardex;
  public viewKardex;

  public workOrders;
  public viewWorkOrders;

  public payment;
  public viewPayment;

  public suppliers;
  public viewSuppliers;

  public cashRegister;
  public viewCasRegister;
  constructor( private authService: AuthService,
               private router: Router,
               private employeesService: EmployeesService,
               private localStorageService: LocalStorageService,
               public inforService: InfoService ){

                const data ={ username: localStorage.getItem("userName")};

    this.employeesService.permissions( data )
    .subscribe({
      next: (resp) => {

        this.localStorageService.setItem<Permission[]>('permissions',resp.permissions);
      },
      error: (error: any) => {
        console.log(error)
 
      }
    });

    this.user = authService.user;
  

    this.employees = (this.storedPermissions?.find((p)=> p.page == "employees")?.permissions );
    this.viewEmployees =  ((this.employees as number >> 0 ) % 2 == 1)? true : false;
    
    this.incidences = ((this.storedPermissions?.find((p)=> p.page == "incidences")?.permissions ));
    this.viewIncidences =  ((this.incidences as number >> 0)  % 2 == 1)? true : false;

    this.bonuses = ((this.storedPermissions?.find((p)=> p.page == "bonuses")?.permissions ));
    this.viewBonuses =  ((this.bonuses as number >> 0)  % 2 == 1)? true : false;

    this.workStation = ((this.storedPermissions?.find((p)=> p.page == "workStation")?.permissions ));
    this.viewWorkStation =  ((this.workStation as number >> 0)  % 2 == 1)? true : false;

    this.customer = ((this.storedPermissions?.find((p)=> p.page == "customer")?.permissions ));
    this.viewCustomer =  ((this.customer as number >> 0)  % 2 == 1)? true : false;

    this.budgets = ((this.storedPermissions?.find((p)=> p.page == "budgets")?.permissions ));
    this.viewBudgets =  ((this.budgets as number >> 0)  % 2 == 1)? true : false;

    this.contracts = ((this.storedPermissions?.find((p)=> p.page == "contracts")?.permissions ));
    this.viewContracts =  ((this.contracts as number >> 0)  % 2 == 1)? true : false;

    this.sale = ((this.storedPermissions?.find((p)=> p.page == "sale")?.permissions ));
    this.viewsale =  ((this.sale as number >> 0)  % 2 == 1)? true : false;

    this.template = ((this.storedPermissions?.find((p)=> p.page == "template")?.permissions ));
    this.viewTemplate =  ((this.template as number >> 0)  % 2 == 1)? true : false;

    this.calendarType = ((this.storedPermissions?.find((p)=> p.page == "calendar type")?.permissions ));
    this.viewCalendarType =  ((this.calendarType as number >> 0)  % 2 == 1)? true : false;

    this.store = ((this.storedPermissions?.find((p)=> p.page == "store")?.permissions ));
    this.viewStore =  ((this.store as number >> 0)  % 2 == 1)? true : false;



    this.leads = ((this.storedPermissions?.find((p)=> p.page == "leads")?.permissions ));
    this.viewLeads =  ((this.leads as number >> 0)  % 2 == 1)? true : false;

    this.business = ((this.storedPermissions?.find((p)=> p.page == "business line")?.permissions ));
    this.viewBusiness =  ((this.business as number >> 0)  % 2 == 1)? true : false;

    this.kardex = ((this.storedPermissions?.find((p)=> p.page == "kardex")?.permissions ));
    this.viewKardex =  ((this.kardex as number >> 0)  % 2 == 1)? true : false;

    this.workOrders = ((this.storedPermissions?.find((p)=> p.page == "work orders")?.permissions ));
    this.viewWorkOrders =  ((this.workOrders as number >> 0)  % 2 == 1)? true : false;

    this.payment = ((this.storedPermissions?.find((p)=> p.page == "payment")?.permissions ));
    this.viewPayment =  ((this.payment as number >> 0)  % 2 == 1)? true : false;

    this.suppliers = ((this.storedPermissions?.find((p)=> p.page == "suppliers")?.permissions ));
    this.viewSuppliers =  ((this.suppliers as number >> 0)  % 2 == 1)? true : false;

    
    this.cashRegister = ((this.storedPermissions?.find((p)=> p.page == "cash register")?.permissions ));
    this.viewCasRegister =  ((this.cashRegister as number >> 0)  % 2 == 1)? true : false;
  }


  isActiveRoute( route: string ) {
    const arr = this.router.url.split('/');
    return arr.includes(route);
  }

  upload( files: any ) {

    this.file = files[0];

    if ( !this.file ) {
      this.fileTemp = null;
      return;
    }

    const isValid = this.validateFile(this.file);

    if ( !isValid ){
      this.file = null;
      this.fileTemp = null;
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL( this.file );
    reader.onloadend = () => {
      this.fileTemp = reader.result;
    }


    this.inforService.uploadLogo( this.file )
      .subscribe({
        next: (  ) => {
          console.log('SUCCESS!')
        }, 
        error: () => {
          Swal.fire({
            text: 'Error al actualizar el logo de la empresa.',
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })


  }

  validateFile( file: File ): boolean{


    if (!this.validTypes.includes(file.type) ){
      Swal.fire({
        text: 'Tipo de archivo inválido',
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
      return false;
    }

    if ( file.size > 4 * 1024 * 1024 ) {
      Swal.fire({
        text: 'Excedió límite. Máximo 4MB.',
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
      return false;
    }

    return true;
  }

}
