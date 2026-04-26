import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { CustomersService } from '../../services/customers.service';
import { CustomersPaymentsService } from '../../services/payments.service';
import * as moment from 'moment-timezone';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { Customer } from '../../interfaces';
import { environment } from 'src/environments/environment.development';
import { BalanceCustomer } from 'src/app/dashboard/suppliers/interfaces/balance-customers.interface';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza-sales.component.html',
  styleUrls: ['./cobranza-sales.component.scss']
})
export class CobranzaSalesComponent implements OnInit {

  public fileUrl: string = environment.apiUrl;


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

  public balance: any[] = [];

  public saleFolioSelect: string = '';
  public bSaleSelected: any;
  public balanceSelected: number = 0;

  public documentType: 'R' | 'F' = 'R';

  public customers: MultiSelectData[] = [];
  public customerSelected: any = [];


  public dropdownSettingsSingle = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Selecciona cliente",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  }; 



  constructor( private customerService: CustomersService,
               private paymentsService: CustomersPaymentsService,
               public modalService: ModalService,
               public activatedRoute: ActivatedRoute,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) {
  }
 
 
 public edit:any;
  
  ngOnInit(): void {

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "payment")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 

    for (let anio = 2000; anio <= moment( Date.now() ).get('year'); anio++) {
      this.years.push(anio);
    }
    this.yearSelected = moment( Date.now() ).get('year');
          
    this.getCustomers();

    this.activatedRoute.params.subscribe( ({documentType}) => {
      this.getBalance( documentType );
      this.documentType = documentType;
    });
    
  }
    
  getCustomers() {
    this.isLoading = true;
    this.customerService.getAllWithoutPagination()
      .subscribe({
        next: (resp: any) => {
          this.customers = this.tranformData(resp.customers);
          this.customerSelected = [];
          this.getBalance( this.documentType );
        },
    })
  }

  tranformData( customers: Customer[] ): MultiSelectData[] {
    return customers.map( c => {
      return {
        id: c.id,
        itemName: c.name
      }
    });
  }



  getBalance( documentType: 'R' | 'F' ) {
    this.isLoading = true;
    this.paymentsService.getBalanceSales( this.currentPage, this.limit, this.yearSelected, documentType, this.customerSelected[0]?.id)
      .subscribe({
        next: (resp: any) => {
          this.balance = this.mapBalance(resp.balance);
          console.log(this.balance)
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  mapBalance( balance: BalanceCustomer[] ) {
    return balance.map( (item, idx) => {
      
      if ( item.concept == 'payment' ) {

        if ( idx == 0 ) {
          item.balance = item.amount
        } else {
          if ( balance[ idx - 1].concept == 'sale' ) {
            item.balance = (Number(balance[idx - 1].balance) - Number(item.amount));
          } else if ( balance[ idx - 1].concept == 'payment' ) {
            item.balance = (Number(balance[idx - 1].balance) - Number(item.amount))
          }
        }
        
      } else if ( item.concept == 'sale' ) {

        if ( idx == 0 ) {
          item.balance = item.amount
        } else {
          if ( balance[ idx - 1].concept == 'sale' ) {
            item.balance = (Number(balance[idx - 1].balance) + Number(item.amount))
          } else if ( balance[ idx - 1].concept == 'payment' ) {
            item.balance = (Number(balance[idx - 1].balance) + Number(item.amount))
          }
        }

      }

      return item;
    });
  }



  addPayment( item: any  ) {
    if ( item.concept != 'sale' ) return;
    this.saleFolioSelect = item.sale.folio;
    this.bSaleSelected = item;
    const pays = this.balance.filter( b => b.concept == 'payment' && b.bSaleId == this.bSaleSelected.id);
    this.balanceSelected = pays.length > 0 ? +pays[ pays.length - 1 ].balance : +item.balance;
    this.modalService.openModal();
  }


  newPaymentEvent() {
    this.currentPage = 1;
    this.getBalance(this.documentType);
  }


  onYearChange() {
    this.currentPage = 1;
    this.getBalance(this.documentType);
  }


  onItemSelect( event: any ) {
    this.currentPage = 1;
    this.getBalance( this.documentType );
  }

  OnItemDeSelect( event: any ) {
    this.getBalance( this.documentType );
  }

  onSelectAll( event: any ) {
    console.log(event)
  }

  onDeSelectAll( event: any ) {
    this.getBalance( this.documentType );
  }


  exportToExcel(){
    this.paymentsService.exportToExcelSales(this.yearSelected,this.documentType, this.customerSelected[0]?.id, 'cobranza-ventas')
      .subscribe( {
        next: ( resp ) => {
          const path = `${this.fileUrl}/uploads/docs/balancesCustomer/${resp.fileName}`;
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


}
