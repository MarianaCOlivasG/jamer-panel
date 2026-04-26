import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PurchaseOrder } from 'src/app/dashboard/purchase-orders/interfaces/purchase-order.interface';
import { PurchaseOrdersService } from 'src/app/dashboard/purchase-orders/services/purchase-orders.service';
import { Supplier } from 'src/app/dashboard/suppliers/interfaces';
import { SuppliersService } from 'src/app/dashboard/suppliers/services/suppliers.service';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'purchase-orders-modal',
  templateUrl: './purchase-orders-modal.component.html',
  styleUrls: ['./purchase-orders-modal.component.scss']
})
export class PurchaseOrdersModalComponent implements OnInit {

  @Output() newPurchaseOrderSelected = new EventEmitter<PurchaseOrder>();

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
                private modalService: ModalService ) { }

  ngOnInit(): void {

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


  handleSelected( idx: number ) {
    this.newPurchaseOrderSelected.emit(this.purchaseOrders[idx]);
    this.modalService.closeModal();
  }


  closeModal() {
    this.modalService.closeModal();
  }

}
