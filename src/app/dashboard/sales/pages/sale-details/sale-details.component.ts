import { Component } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { ModalService } from 'src/app/shared/services/modal.service';
import * as moment from 'moment-timezone';
import { Location } from '@angular/common';
import { Sale } from '../../interfaces/sale.interface';
import { Payment } from 'src/app/dashboard/purchases/interfaces/payment.interface';
import { SalesService } from '../../services/sales.service';
import { PaymentsService } from 'src/app/dashboard/purchases/services/payments.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-sale-details',
  templateUrl: './sale-details.component.html',
  styleUrls: ['./sale-details.component.scss']
})
export class SaleDetailsComponent {

  
  public sale!: Sale; 

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;

  public isSending: boolean = false;

  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir',
  ];

  public newsPayments: Payment[] = [];
  public balance: number = 0;

  public isSaving: boolean = false;

  constructor( private activatedRoute: ActivatedRoute,
               private salesService: SalesService,
               public authService: AuthService,
               public modalService: ModalService,
               private paymentsService: PaymentsService,
               private router: Router,
               private location: Location,
               private localStorageService: LocalStorageService,
               ){}

  ngOnInit(): void {

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "kardex")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
   
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.salesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.sale = resp.sale;
        console.log(this.sale)
        this.isLoading = false;
        // this.changePaymentAmount();
      });
  }

  openModal() {
    this.modalService.openModal();
  }


  addPayment() {
    const exist0 = this.newsPayments.find( p => Number(p.amount) == 0 );
    if ( exist0 ) return;
    this.newsPayments.push({
      concept: 'Efectivo',
      amount: 0
    });
  }

  removePayment( idx: number ) {
    this.newsPayments.splice(idx, 1);
    // this.calculateTotals();
    // this.changePaymentAmount();
  }

  // changePaymentAmount() {
  //   const sum1 = this.sale.payments.reduce((previous, current) => {
  //     return previous + Number(current.amount);
  //   }, 0);
  //   const sum2 = this.newsPayments.reduce((previous, current) => {
  //     return previous + Number(current.amount);
  //   }, 0);

  //   this.balance = Number(this.sale.totalWithIva) - (sum1 + sum2)
  // }



  goToBack(): void {
    this.location.back();
  }


}
