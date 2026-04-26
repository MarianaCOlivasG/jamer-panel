import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import * as moment from 'moment-timezone';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/dashboard/customers/interfaces';
import { CashRegisterService } from '../../services/cash-register.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-cash-register',
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.scss']
})
export class CashRegisterComponent implements OnInit {

  public fileUrl: string = environment.apiUrl;


  public isLoading: boolean = true;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public months: any[] = [
    {
      sigla: 'all',
      label: 'Todos'
    },
    {
      sigla: '01',
      label: 'Enero'
    },
    {
      sigla: '02',
      label: 'Febrero'
    },
    {
      sigla: '03',
      label: 'Marzo'
    },
    {
      sigla: '04',
      label: 'Abril'
    },
    {
      sigla: '05',
      label: 'Mayo'
    },
    {
      sigla: '06',
      label: 'Junio'
    },
    {
      sigla: '07',
      label: 'Julio'
    },
    {
      sigla: '08',
      label: 'Agosto'
    },
    {
      sigla: '09',
      label: 'Septiembre'
    },
    {
      sigla: '10',
      label: 'Octubre'
    },
    {
      sigla: '11',
      label: 'Noviembre'
    },
    {
      sigla: '12',
      label: 'Diciembre'
    }
  ];

  public registerSelected: any;

  
  public monthSelected: any = 'all'
  public years: number[] = [];
  public yearSelected: number = 0;

  public registers: any[] = [];
  
  public modalSelected: 'create' | 'validate' | null = null;

 

  constructor( private cashRegisterService: CashRegisterService,
               public modalService: ModalService,
               public activatedRoute: ActivatedRoute,
               public authService: AuthService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) {
  }
 
  public create: any;
  public edit:any;
 // public deleted:any;
  public validated:any;
 
  
  ngOnInit(): void {
    
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "cash register")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
   //  this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
   this.validated =  ((permissions as number >> 4 ) % 2 == 1)? true :false;
    for (let anio = 2000; anio <= moment( Date.now() ).get('year'); anio++) {
      this.years.push(anio);
    }
    this.yearSelected = moment( Date.now() ).get('year');
          
    
    this.getRegisters();
    
  }

  getRegisters() {
    this.isLoading = true;
    this.cashRegisterService.getAll( this.currentPage, this.limit )
      .subscribe({
        next: (resp: any) => {
          this.registers = this.transform(resp.cashRegister);
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    });
  }


  transform( cashRegister: any[] ) {
    return cashRegister.map( (register, idx) => {
      
      // Si es el primer elemento
      if ( idx == 0 ) {
        register.total = register.amount
      } else {
        register.total = ( register.movement == 'E' ) ? Number(cashRegister[idx - 1].total) + Number(register.amount) : Number(cashRegister[idx - 1].total) - Number(register.amount);
      }

      return register;
    })
  }



  createOrUpdate( item?: any ) {
    this.registerSelected = item;
    if ( this.registerSelected && this.authService.user.role.id != 1 ) return;
    this.modalService.openModal();
    this.modalSelected = 'create';
  }


  validate( item?: any ) {
    this.registerSelected = item;
    if ( this.registerSelected && this.authService.user.role.id != 1 ) return;
    this.modalService.openModal();
    this.modalSelected = 'validate';
  }



  closeModal( ) {
    this.registerSelected = null;
    this.modalSelected = null;
    this.modalService.closeModal();
  }

  newRegister( success: boolean ) {
    this.closeModal();
    if ( !success ) return;
    this.currentPage = 1;
    this.getRegisters();
  }


  changePage( currentPage: number ) {
    this.currentPage = currentPage;
    if ( !this.isSuggestions ) {
      this.getRegisters();
    } else {
      // this.searchProducts();
    }
  }

}
