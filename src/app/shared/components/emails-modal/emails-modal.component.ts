import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { BudgetsService } from 'src/app/dashboard/customers/services/budgets.service';
import Swal from 'sweetalert2';
import { ContractsService } from 'src/app/dashboard/customers/services/contracts.service';
import { PurchaseOrdersService } from 'src/app/dashboard/purchase-orders/services/purchase-orders.service';
import { PurchasesService } from 'src/app/dashboard/purchases/services/purchases.service';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { CustomersService } from 'src/app/dashboard/customers/services/customers.service';

@Component({
  selector: 'emails-modal',
  templateUrl: './emails-modal.component.html',
  styleUrls: ['./emails-modal.component.scss']
})
export class EmailsModalComponent implements OnInit{

  @Output() onFinishEvent = new EventEmitter<null>();

  @Input() entityId!: string | number;
  @Input() entity!: 'budget' | 'purchase' | 'purchaseOrder' | 'contract' | 'workOrder' | 'customers' | 'nota-venta';
  @Input() customerEmail: string | undefined;
  @Input() DesgloseIva: boolean = false;
  @Input() DesgloseIvaBudget: boolean = false;

  public emails: {display: string; value: string}[] = [];
  public isSending: boolean = false;

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
  }

  closeModal() {
    this.modalService.closeModal();
    this.modalService.name= "";

  }

  async sendByCustomerEmail() {
    console.log("customerEmail", this.emails);
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

    const serviceInstance = 

                            (this.entity == 'purchase') ? this.purchasesService : 
                            (this.entity == 'purchaseOrder') ? this.purchaseOrdersService : 
                            (this.entity == 'contract') ? this.contractsService : 
                            (this.entity == 'customers') ? this.customersService : 
                            (this.entity == 'workOrder') ? this.workOrderService :
                            (this.entity == 'nota-venta') ? this.workOrderService : null;
    

                            if(this.entity == 'budget') {
   
                              this.budgetsServices.sendEmail( entityId, emails, this.DesgloseIvaBudget )
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
                        
                              return;
                            }
    if ( !serviceInstance  ) return;


    if( this.entity == 'nota-venta' ) {

      this.workOrderService.sendNotaVentaPDF( +entityId, emails, this.DesgloseIva )
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


      return;
    }


  
    serviceInstance.sendEmail( entityId, emails )
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


}
