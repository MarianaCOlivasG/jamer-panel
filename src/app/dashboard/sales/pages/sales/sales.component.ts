import { Component } from '@angular/core';
import { Sale } from '../../interfaces/sale.interface';
import { Customer } from 'src/app/dashboard/customers/interfaces';
import { CustomersService } from 'src/app/dashboard/customers/services/customers.service';
import { SalesService } from '../../services/sales.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent {


  public sales: Sale[] = [];
  public customers: Customer[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public customerSelected!: Customer | undefined;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor(  private customerService: CustomersService,
                private salesService: SalesService,
                private localStorageService: LocalStorageService,
                private router: Router,
                ) { }
public create:any;
  ngOnInit(): void {
  
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "kardex")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
  
    this.customerService.getAllWithoutPagination()
      .subscribe({
        next: ({ customers }: any) => {
          this.customers = customers;
          this.customerSelected = undefined;
          this.getAll()
        },
    });

  }




  getAll() {
    this.isLoading = true;
    this.salesService.getAll( this.currentPage, this.limit, this.customerSelected?.id)
      .subscribe({
        next: (resp: any) => {
          this.sales = resp.sales;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchSales() {
    this.isLoading = true;
    this.salesService.search(this.currentPage, this.limit, this.customerSelected?.id, this.querySearch )
      .subscribe({
        next: (resp: any) => {
          this.sales = resp.sales;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }




  search( query:string ):void {

    this.currentPage = 1;

    if ( query.length == 0 ) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.getAll()
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchSales()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll()
      } else {
        this.searchSales()
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    switch ( formName ) {
      case 'customerId':
          this.getAll()
        break;  
      default:
        break;
    }
  }

}
