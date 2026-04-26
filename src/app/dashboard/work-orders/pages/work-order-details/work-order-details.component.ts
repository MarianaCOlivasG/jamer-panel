import { ChangeDetectorRef, Component } from '@angular/core';
import { WorkOrder } from '../../interfaces/work-order.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrdersService } from '../../services/work-orders.service';
import { switchMap } from 'rxjs';
import { MarkerGoogle } from 'src/app/shared/interfaces/marker-google.interface';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.development';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-work-order-details',
  templateUrl: './work-order-details.component.html',
  styleUrls: ['./work-order-details.component.scss']
})
export class WorkOrderDetailsComponent {

  public fileUrl: string = environment.apiUrl;
  
  public workOrder!: WorkOrder; 
  public isLoading: boolean = true;
  public markers: MarkerGoogle[] = [];
  selectAll: boolean = false;
  totalImpuestos: number = 0;
  totalBaseGravable: number = 0;
  totalImpuesto: number = 0;
  total: number = 0;

  public desgloseIva: boolean = false;
  constructor( private activatedRoute: ActivatedRoute,
               private workOrdersService: WorkOrdersService,
               private location: Location,
               public modalService: ModalService,
               private localStorageService: LocalStorageService,
               private router: Router,
               private cdRef: ChangeDetectorRef
    ){}
    public edit:any;
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "work orders")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.workOrdersService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.workOrder = resp.workOrder;
        this.workOrder.totalWithIva = Number(String(this.workOrder.totalWithIva).replace(/,/g, ''));

        this.isLoading = false;

        this.markers.push({
          content: `
          <center>
            <span><strong>${this.workOrder.address.name}</strong></span>
            </br>
            <span>${this.workOrder.address.address}</span>
          </center>
          `,
          position: {
            lat: this.workOrder.address.lat,
            lng: this.workOrder.address.lng,
          }
        });
        this.cdRef.detectChanges();

      });
  }


  async handleCancel() {

      const { isConfirmed } = await Swal.fire({
        title: `¿Estás seguro?`,
        text: `Se cancelará la orden de trabajo. `,
        confirmButtonText: `¡Si, cancelar!`,
        confirmButtonColor: '#43B02A',
        showCancelButton: true,
        cancelButtonText: '¡No, cancelar!',
        cancelButtonColor: '#f23e3e',
        allowOutsideClick: false
      })
  
      if ( !isConfirmed ) return;
  
      this.workOrdersService.cancelled( this.workOrder.id )
        .subscribe({
          next: ( resp ) => {

            this.workOrder.statusId = 2;

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
  



  goToBack(): void {
    this.location.back();
  }


  async updateNoFactura() {

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se actualizará el número de factura del servicio. `,
      confirmButtonText: `¡Si, actualizar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    console.log(this.workOrder.id);

    this.workOrdersService.updateTimes( this.workOrder.id, { noFactura: this.workOrder.noFactura })
      .subscribe({
        next: ( resp ) => {
          Swal.fire({
            text: 'No. de factura actualizado con éxito.',
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


  generarNotaVenta(desglosarIva: boolean){

    Swal.fire({
      text: 'Generando PDF, Por favor espere...',
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    this.workOrdersService.generateNotaVentaPDF( +this.workOrder.id, desglosarIva )
      .subscribe({
        next: ( resp ) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

          console.log(resp);


          const path = `${this.fileUrl}/uploads/docs/nota-venta/${resp.fileName}`;
          window.open(path, '_blank');

        },
        error: (error) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }
  generatePDF(workOrderId= this.workOrder.id) {
    Swal.fire({
      text: 'Generando PDF, Por favor espere...',
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    this.workOrdersService.generatePDF(+workOrderId)
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

          const path = `${this.fileUrl}/uploads/docs/workOrders/${resp.fileName}`;
            window.open(path, '_blank');
  
  
        
        },
        error: (error) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }


  sendNotaVenta(desglosarIva: boolean) {
    
    this.modalService.openModal();
  }


  getTotalToPay(): string {
    const total = this.workOrder.workOrdersContractProducts.reduce((total, cp) => {
      const unitPrice = Number(cp.contractProduct.unitPrice);
      const amount = Number(cp.amount); // Cantidad de productos
      const priceWithoutTax = unitPrice * amount; // Precio total sin impuesto
      this.totalBaseGravable = priceWithoutTax;
      const tax = priceWithoutTax * 0.16; // IVA (16%)
      this.totalImpuesto = tax;
      this.total= priceWithoutTax + tax;
      return total + priceWithoutTax + tax; // Suma precio con impuesto
    }, 0);
    
    this.totalBaseGravable = (total  * 100)/ 116;
    this.totalBaseGravable = this.totalBaseGravable;
    this.totalImpuesto = total - this.totalBaseGravable;
    this.total = total;
    // Devuelve el total formateado como moneda en pesos mexicanos
    return total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }
  

  /**
 * Formatea el número como moneda en pesos mexicanos con dos decimales.
 * @param value - Valor a formatear.
 * @returns {string} Moneda formateada.
 */
formatCurrency(value: number): string {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

/**
 * Calcula el impuesto (IVA) basado en el 16%.
 * @param item - Objeto con la información del producto.
 * @returns {string} Impuesto formateado.
 */
calculateTax(item: any): string {
  const priceWithoutTax = item.amount *item.contractProduct.unitPrice;
  const tax = priceWithoutTax * 0.16; // 16% de IVA
  return this.formatCurrency(tax);
}

/**
 * Calcula el total con impuesto incluido.
 * @param item - Objeto con la información del producto.
 * @returns {string} Total formateado.
 */
calculateTotal(item: any): string {
  const priceWithoutTax = item.amount * item.contractProduct.unitPrice;
  const total = priceWithoutTax * 1.16; // Precio con IVA
  return this.formatCurrency(total);
}

}
