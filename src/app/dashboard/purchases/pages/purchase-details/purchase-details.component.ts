import { Component } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { PurchasesService } from '../../services/purchases.service';
import { Purchase } from '../../interfaces/purchase.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Payment } from '../../interfaces/payment.interface';
import * as moment from 'moment-timezone';
import { PaymentsService } from '../../services/payments.service';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-purchase-details',
  templateUrl: './purchase-details.component.html',
  styleUrls: ['./purchase-details.component.scss']
})
export class PurchaseDetailsComponent {

  
  public purchase!: Purchase; 

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
               private purchasesService: PurchasesService,
               public authService: AuthService,
               public modalService: ModalService,
               private paymentsService: PaymentsService,
               private router: Router,
               private location: Location,
               private localStorageService: LocalStorageService, ){}

  ngOnInit(): void {

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "kardex")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.purchasesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.purchase = resp.purchase;
        console.log(this.purchase)
        this.isLoading = false;
        this.changePaymentAmount();
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
    this.changePaymentAmount();
  }

  changePaymentAmount() {
    const sum1 = this.purchase.payments.reduce((previous, current) => {
      return previous + Number(current.amount);
    }, 0);
    const sum2 = this.newsPayments.reduce((previous, current) => {
      return previous + Number(current.amount);
    }, 0);

    this.balance = Number(this.purchase.totalWithIva) - (sum1 + sum2)
  }


  async addPaymentsToPurchase() {
   
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se agregarán pagos a la compra`,
      confirmButtonText: `¡Si, actualizar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    const ex = moment(this.purchase.expirationDate).tz('America/Cancun');
    const today = moment(moment(Date.now()).format('YYYY-MM-DD'));

    const data = {
      payments: this.newsPayments.filter( p => Number(p.amount) > 0),
      status: ( this.balance == 0 && !ex.isSameOrAfter(today)) ? 'late-payment' : 
        ( this.balance == 0 && ex.isSameOrAfter(today)) ? 'paid' : 
        ( this.balance > 0 && ex.isSameOrAfter(today) ) ? 'pending' : 
        ( this.balance > 0 && !ex.isSameOrAfter(today) ) ? 'not-paid' : 
        ( this.balance < 0 && ex.isSameOrAfter(today) ) ? 'surplus': 
        ( this.balance < 0 && !ex.isSameOrAfter(today) ) ? 'late-payment' :
        ( this.balance == 0 ) ? 'paid' :
        ( this.balance > 0 ) ? 'pending' :
        ( this.balance < 0 ) ? 'surplus' : ''
    }

    this.paymentsService.addPaymentsToPurchaseId( this.purchase.id, data )
      .subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.router.navigateByUrl(`/purchases/details/${resp.purchase.id}`)
        },
        error: (error) => {
          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
        }
    })


  }


  goToBack(): void {
    this.location.back();
  }


  
  async downloadPDF() {
    const resp = await this.purchasesService.downloadPDF( +this.purchase.id );
    window.open(`${this.fileUrl}/uploads/docs/purchases/${resp.pdfName}`, '_blank');
  }


}
