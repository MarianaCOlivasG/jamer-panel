import { Component } from '@angular/core';
import { Payment } from '../../interfaces/payment.interface';
import { Purchase } from '../../interfaces/purchase.interface';
import { PurchasesService } from '../../services/purchases.service';
import { PaymentsService } from '../../services/payments.service';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent {

  public payments: Payment[] = [];
  public purchases: MultiSelectData[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;
  public totalAmmount: number = 0;

  public purchaseSelected: any = [];
  public purchaseDetails!: Purchase | undefined;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  public dropdownSettingsSingle = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Selecciona una compra",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  }; 

  constructor(  private paymentsService: PaymentsService,
                private purchasesService: PurchasesService ) { }

  ngOnInit(): void {

    this.purchasesService.getAllWithoutPagination()
      .subscribe({
        next: ({ purchases }: any) => {
          this.purchases = this.transformData(purchases);
          // this.purchaseSelected = undefined;
          this.getAll()
        },
    });

  }


  private transformData( purchases: Purchase[] ): MultiSelectData[] {
    return purchases.map( purchase => {
      return {
        id: purchase.id,
        itemName: purchase.folio
      }
    })
  }


  getAll() {
    this.isLoading = true;
    this.paymentsService.getAll( this.currentPage, this.limit, this.purchaseSelected[0]?.id)
      .subscribe({
        next: (resp: any) => {
          this.payments = resp.payments;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
          this.totalAmmount = resp.total;
        },
    })
  }


  searchPayments() {
    this.isLoading = true;
    this.paymentsService.search(this.currentPage, this.limit, this.purchaseSelected[0]?.id, this.querySearch )
      .subscribe({
        next: (resp: any) => {
          this.payments = resp.payments;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
          this.totalAmmount = resp.total;
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
    this.searchPayments()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll()
      } else {
        this.searchPayments()
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    switch ( formName ) {
      case 'purchaseId':
          this.getAll()
        break;  
      default:
        break;
    }
  }

  onItemSelect(item:any){


    this.purchasesService.getById( this.purchaseSelected[0]?.id )
    .subscribe({
      next: ({purchase}) => {
        this.purchaseDetails = purchase;
      }
    })

    if ( !this.isSuggestions ) {
      this.getAll();
    } else {
      this.searchPayments();
    }
  }
  OnItemDeSelect(item:any){
  }

  onSelectAll(items: any){
  }

  onDeSelectAll(items: any){
    this.purchaseDetails = undefined;
    if ( !this.isSuggestions ) {
      this.getAll();
    } else {
      this.searchPayments();
    }
  }

}
