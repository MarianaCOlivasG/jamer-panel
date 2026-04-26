import { Component, OnInit } from '@angular/core';
import { Supplier } from '../../interfaces';
import { SuppliersService } from '../../services/suppliers.service';
import { PaymentsService } from 'src/app/dashboard/purchases/services/payments.service';
import { Balance } from '../../interfaces/balance.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environment } from 'src/environments/environment.development';
import Swal from 'sweetalert2';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {

  public fileUrl: string = environment.apiUrl;


  public suppliers: MultiSelectData[] = [];

  public balance: Balance[] = [];
  public balanceMonth: Balance[] = [];

  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 10;

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
  public monthSelected: any = 'all'
  public years: number[] = [];
  public yearSelected: number = 0;
  public supplierSelected: any = [];
  public bPurchaseSelected!: Balance;

  public sPage: number = 1;


  public dropdownSettingsSingle = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Selecciona proveedor",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  }; 

  public balanceSelected: number = 0;

  constructor( private suppliersService: SuppliersService,
               private paymentsService: PaymentsService,
               public modalService: ModalService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) { }
 
               public edit:any;

 
  ngOnInit(): void {

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "suppliers")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
    for (let anio = 2000; anio <= moment( Date.now() ).get('year'); anio++) {
      this.years.push(anio);
    }
    this.getSuppliers();
    this.yearSelected = moment( Date.now() ).get('year');
  }


  getSuppliers() {
    this.isLoading = true;
    this.suppliersService.getAll( this.sPage, 5, 0 )
      .subscribe({
        next: (resp: any) => {
          this.suppliers = this.tranformData(resp.suppliers);
          this.supplierSelected =[ { id: this.suppliers[0].id, itemName: this.suppliers[0].itemName }];
          this.getBalance();
        },
    })
  }

  tranformData( suppliers: Supplier[] ): MultiSelectData[] {
    return suppliers.map( s => {
      return {
        id: s.id,
        itemName: s.name
      }
    })
  }


  getBalance() {
    this.isLoading = true;
    this.paymentsService.getBalance( this.currentPage, this.limit, this.supplierSelected[0].id, this.yearSelected)
      .subscribe({
        next: (resp: any) => {
          this.balance = this.mapBalance(resp.balance);
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  filterByMonth() {

    console.log(this.balance)
  }
          
  mapBalance( balance: Balance[] ) {
    return balance.map( (item, idx) => {
      
      if ( item.concept == 'payment' ) {

        if ( idx == 0 ) {
          item.balance = item.amount
        } else {
          if ( balance[ idx - 1].concept == 'purchase' ) {
            item.balance = (Number(balance[idx - 1].balance) - Number(item.amount));
          } else if ( balance[ idx - 1].concept == 'payment' ) {
            item.balance = (Number(balance[idx - 1].balance) - Number(item.amount))
          }
        }
        
      } else if ( item.concept == 'purchase' ) {

        if ( idx == 0 ) {
          item.balance = item.amount
        } else {
          if ( balance[ idx - 1].concept == 'purchase' ) {
            item.balance = (Number(balance[idx - 1].balance) + Number(item.amount))
          } else if ( balance[ idx - 1].concept == 'payment' ) {
            item.balance = (Number(balance[idx - 1].balance) + Number(item.amount))
          }
        }

      }

      return item;
    });
  }


  changePage( currentPage: number ) {
    this.currentPage = currentPage;
    this.getBalance();
  }

  onYearChange() {
    this.currentPage = 1;
    this.getBalance();
  }


  newPaymentEvent() {
    this.currentPage = 1;
    this.getBalance();
  }

  addPayment( item: Balance,  ) {
    if ( item.concept != 'purchase' ) return;
    this.bPurchaseSelected = item;
    const pays = this.balance.filter( b => b.concept == 'payment' && b.bPurchase.id == this.bPurchaseSelected.id);
    this.balanceSelected = pays.length > 0 ? +pays[ pays.length - 1 ].balance : +item.balance;
    this.modalService.openModal();
  }


  getTotalAcuenta() {
    const reduce = this.balance.reduce((prev, current) =>{ 
      if ( current.concept == 'purchase') return prev;
      return prev + Number(current.amount);
    }, 0);
    return reduce;
  }


  getTotalImporte() {
    const reduce = this.balance.reduce((prev, current) =>{ 
      if ( current.concept == 'payment') return prev;
      return prev + Number(current.amount);
    }, 0);
    return reduce;
  }


  exportToExcel() {
    this.paymentsService.exportToExcel( this.supplierSelected[0].id, this.supplierSelected[0].itemName)
      .subscribe({
        next: ( resp ) => {
          const path = `${this.fileUrl}/uploads/docs/balances/${resp.fileName}`;
          window.open(path, '_blank');

          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        },
        error: ( error ) => {
          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }


  onItemSelect( event: any ) {
    this.currentPage = 1;
    this.getBalance();
  }

  OnItemDeSelect( event: any ) {
    console.log(event);
  }

  onSelectAll( event: any ) {
    console.log(event)
  }

  onDeSelectAll( event: any ) {
    this.balance = [];
  }


}
