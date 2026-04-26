import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BudgetsService } from 'src/app/dashboard/customers/services/budgets.service';
import Swal from 'sweetalert2';
import { ContractsService } from 'src/app/dashboard/customers/services/contracts.service';
import { PurchaseOrdersService } from 'src/app/dashboard/purchase-orders/services/purchase-orders.service';
import { PurchasesService } from 'src/app/dashboard/purchases/services/purchases.service';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { CustomersService } from 'src/app/dashboard/customers/services/customers.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'emails-facturas-modal',
  templateUrl: './emails-facturas-modal.component.html',
  styleUrls: ['./emails-facturas-modal.component.scss']
})
export class EmailsFacturasModalComponent implements OnInit{

  public fileUrl: string = environment.apiUrl;


  @Output() onFinishEvent = new EventEmitter<null>();

  @Input() entityId!: string | number;
  @Input() entity!: 'budget' | 'purchase' | 'purchaseOrder' | 'contract' | 'workOrder' | 'customers';
  @Input() customerEmail: string | undefined;

  public emails: {display: string; value: string}[] = [];
  public isSending: boolean = false;

  public facturas: any[] = [];

  constructor( private modalService: ModalService,
               private budgetsServices: BudgetsService,
               private contractsService: ContractsService,
               private purchaseOrdersService: PurchaseOrdersService,
               private purchasesService: PurchasesService,
               private customersService: CustomersService,
               private workOrderService: WorkOrdersService ) {}


  ngOnInit(): void {
    if ( !this.customerEmail ) return;
    this.emails.push({display: this.customerEmail, value: this.customerEmail});

    this.getFacturas();
  }

  getFacturas() {
    this.customersService.getFacturas( this.entityId ).subscribe({
      next: ( {facturas}: any ) => {
        this.facturas = facturas.map( (f: any) => {
          return {
            ...f,
            select: false
          }
        });
      }
    })
  }

  closeModal() {
    this.modalService.closeModal();
  }

  async sendByCustomerEmail() {

    if( this.emails.length == 0 ) return;

    this.isSending = true;

    Swal.fire({
        text: 'Enviando, Por favor espere...',
        allowOutsideClick: false,
        showConfirmButton: false,
    });

    const emailsTo = this.emails.map( email => email.value );

    this.sendEmail( String(this.entityId), emailsTo );
    
  }


  sendEmail( entityId: string, emails: string[] ) {
   
    const facturasIds =  this.facturas.filter( f => f.select == true ).map( f => f.id);

    this.customersService.sendEmail( entityId, emails, facturasIds )
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
          this.isSending = false;
          this.modalService.closeModal();
          this.onFinishEvent.emit();
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
          this.isSending = false;
        }
      });

  }


  onSelect( facturaId: number, value: boolean ) {
    this.facturas.find( f => f.id == facturaId ).select = !value;
  }


}
