import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentsService } from 'src/app/dashboard/purchases/services/payments.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { WorkOrder } from 'src/app/dashboard/work-orders/interfaces/work-order.interface';
import { SalesService } from 'src/app/dashboard/sales/services/sales.service';
import { Sale } from 'src/app/dashboard/sales/interfaces/sale.interface';

@Component({
  selector: 'cash-register-modal',
  templateUrl: './cash-register-modal.component.html',
  styleUrls: ['./cash-register-modal.component.scss']
})
export class CashRegisterModalComponent implements OnInit {

  @Output() newRegister = new EventEmitter<boolean>();

  @Input() registerSelected: any;

  public formSubmitted: boolean = false;
  public isSaving: boolean = false;

  public form: FormGroup = this.fb.group({
    'entity': ['sale'],
    'entityId': [''],
    'concept': ['', Validators.required ],
    'amount': ['', Validators.required ],
    'movement': ['E', Validators.required ],
    'employeeId': ['', Validators.required ],
  }); 

  public isEdit: boolean = false;

  public dropdownSettings = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Selecciona una opción",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  };

  public workOrders: MultiSelectData[] = [];
  public sales: MultiSelectData[] = [];

  constructor(  private cashRegisterService: CashRegisterService, 
                private modalService: ModalService, 
                private fb: FormBuilder,
                private workOrdersService: WorkOrdersService,
                private salesServices: SalesService,
                private authService: AuthService ) { }


  async ngOnInit() {

    const resp = await this.loadWorkOrders()
    this.workOrders = this.transformWorkOrders( resp );

    const respSales = await this.loadSales()
    this.sales = this.transformSales( respSales );


    this.form.get('employeeId')?.setValue(this.authService.user.id);

    if ( this.registerSelected) {
      this.isEdit = true;

      const { 
        concept,
        amount,
        movement,
        employeeId,
        workOrderId,
        saleId,
        type } = this.registerSelected;

      const entityId = 
        type == 'workOrder' ? (this.workOrders.find( w => w.id == workOrderId ) ? [this.workOrders.find( w => w.id == workOrderId )] : [])
          : type == 'sale' ? (this.sales.find( s => s.id == saleId ) ? [this.sales.find( s => s.id == saleId )] : [])
          : []

      this.form.setValue({
        entity: type,
        entityId,
        concept,
        amount,
        movement,
        employeeId,
        // workOrderId: this.workOrders.find( w => w.id == workOrderId ) ?[this.workOrders.find( w => w.id == workOrderId )] : []
      });

      return;
    }

  }


  private async loadWorkOrders() {
    try {
      const resp = await this.workOrdersService.getAllWithoutPagination();
      return resp['workOrders']
    } catch (error) {
      console.error('Error loading work orders', error);
      // Manejo de errores aquí
    }
  }



  private async loadSales() {
    try {
      const resp = await this.salesServices.getAllWithoutPagination();
      return resp['sales']
    } catch (error) {
      console.error('Error loading work orders', error);
      // Manejo de errores aquí
    }
  }


  private transformSales( sales: Sale[] ): MultiSelectData[] {
    return sales.map( sale => {
      return {
        id: sale.id,
        itemName: `Venta: ${ sale.folio } | Cliente: ${ sale?.customer?.name } ${ sale?.customer?.lastName }` ,
      };
    })
  }

  private transformWorkOrders( workOrders: WorkOrder[] ): MultiSelectData[] {
    return workOrders.map( workOrder => {
      return {
        id: workOrder.id,
        itemName: `Orden: ${ workOrder.folio } | Cliente: ${ workOrder?.customer?.name } ${ workOrder?.customer?.lastName }` ,
      };
    })
  }
 

  closeModal(){
    this.newRegister.emit(false);
  }


  async submit( ) {

    this.formSubmitted = true;

    if ( this.form.invalid ) return;

    if ( this.isEdit ) {

      this.update();
      return;
    }

    this.create();


  }



  async create( ) {

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se añadirá un registro en la cobranza`,
      confirmButtonText: `¡Si, añadir!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    const { entity, entityId, ...rest } = this.form.value;


    switch ( entity ) {

      case 'sale':
          this.addSale( rest );
        break;


      case 'workOrder':
        this.addWorkOrder( rest );
        break;

      case 'other':
        this.addOther( rest );
        break;

      default:
        break;
    }
   
  }


  async addWorkOrder( rest: any ) {

    const data = {
      ...rest,
      workOrderId: (this.form.get('entityId')?.value as any[]).length > 0 ? this.form.get('entityId')?.value[0].id : null
    }


    try {
      const resp = await this.cashRegisterService.createToWorkOrder( data ).toPromise();

      if ( !resp.status ) {
        Swal.fire({
          text: resp.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
        return;
      }

      Swal.fire({
        text: resp.message,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      })
      
      this.newRegister.emit(true);
      this.modalService.closeModal();
    } catch (error: any) {
      Swal.fire({
        text: error.message,
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
    }
  }
  
  async addSale( rest: any ) {

    const data = {
      ...rest,
      saleId: (this.form.get('entityId')?.value as any[]).length > 0 ? this.form.get('entityId')?.value[0].id : null
    }


    try {
      const resp = await this.cashRegisterService.createToSale( data ).toPromise();

      if ( !resp.status ) {
        Swal.fire({
          text: resp.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
        return;
      }

      Swal.fire({
        text: resp.message,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      })
      
      this.newRegister.emit(true);
      this.modalService.closeModal();
    } catch (error: any) {
      Swal.fire({
        text: error.message,
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
    }
  }


  async addOther( rest: any ) {

    try {
      const resp = await this.cashRegisterService.createToOther( {...rest} ).toPromise();

      if ( !resp.status ) {
        Swal.fire({
          text: resp.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
        return;
      }

      Swal.fire({
        text: resp.message,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      })
      
      this.newRegister.emit(true);
      this.modalService.closeModal();
    } catch (error: any) {
      Swal.fire({
        text: error.message,
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
    }
  }

  async update( ) {


    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se actualizará un registro en la cobranza`,
      confirmButtonText: `¡Si, actualizar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    const data = {
      ...this.form.value,
      workOrderId: (this.form.get('entityId')?.value as any[]).length > 0 ? this.form.get('entityId')?.value[0].id : null
    }

   
    try {
      const resp = await this.cashRegisterService.update( data ).toPromise();

      if ( !resp.status ) {
        Swal.fire({
          text: resp.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isSaving = false;
        return;
      }

      Swal.fire({
        text: resp.message,
        icon: 'success',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      })
      
      this.newRegister.emit(true);
      this.modalService.closeModal();
    } catch (error: any) {
      Swal.fire({
        text: error.message,
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
    }

   
  }


  inputInvalid( campo: string ): boolean {
    if ( this.form.get(campo)?.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }
  }

  errorMessage( campo: string ): string {
    return this.form.get(campo)?.hasError('required') ? `Este campo es requerido.` :
        this.form.get(campo)?.hasError('email') ? `Correo electrónico inválido.` :
        this.form.get(campo)?.hasError('minlength') ? `Mínimo ${this.form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.` :
        this.form.get(campo)?.hasError('maxlength') ? `Máximo ${this.form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.` : '';
  }



  onItemSelect(item:any){
    this.form.get('concept')?.setValue(item.itemName);
  }
  OnItemDeSelect(item:any){
    this.form.get('concept')?.setValue('');
  }
  onSelectAll(items: any){
  }
  onDeSelectAll(items: any){
    this.form.get('concept')?.setValue('');
  }


}
