import { Component } from '@angular/core';
import { PurchaseOrder } from '../../interfaces/purchase-order.interface';
import { Supplier } from 'src/app/dashboard/suppliers/interfaces';
import { SuppliersService } from 'src/app/dashboard/suppliers/services/suppliers.service';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent {

  public purchaseOrders: PurchaseOrder[] = [];
  public suppliers: Supplier[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public supplierSelected!: Supplier | undefined;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor(  private supplierService: SuppliersService,
                private purchaseOrdersService: PurchaseOrdersService,
                private localStorageService: LocalStorageService,
                private router: Router,
                ) { }
                public create: any;
                public edit:any;
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "kardex")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
    this.supplierService.getWithoutPagination()
      .subscribe({
        next: ({ suppliers }: any) => {
          this.suppliers = suppliers;
          this.supplierSelected = undefined;
          this.getAll()
        },
    });

  }




  getAll() {
    this.isLoading = true;
    this.purchaseOrdersService.getAll( this.currentPage, this.limit, this.supplierSelected?.id)
      .subscribe({
        next: (resp: any) => {
          this.purchaseOrders = resp.purchaseOrders;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchPurchaseOrders() {
    this.isLoading = true;
    this.purchaseOrdersService.search(this.currentPage, this.limit, this.supplierSelected?.id, this.querySearch )
      .subscribe({
        next: (resp: any) => {
          this.purchaseOrders = resp.purchaseOrders;
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
    this.searchPurchaseOrders()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll()
      } else {
        this.searchPurchaseOrders()
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    switch ( formName ) {
      case 'supplierId':
          this.getAll()
        break;  
      default:
        break;
    }
  }

}
