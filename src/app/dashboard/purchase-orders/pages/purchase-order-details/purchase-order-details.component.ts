import { Component } from '@angular/core';
import { PurchaseOrder } from '../../interfaces/purchase-order.interface';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss']
})
export class PurchaseOrderDetailsComponent {

  
  public purchaseOrder!: PurchaseOrder; 

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;

  public isSending: boolean = false;


  constructor( private activatedRoute: ActivatedRoute,
               private purchaseOrdersService: PurchaseOrdersService,
               public authService: AuthService,
               public modalService: ModalService,
              private location: Location,

               private localStorageService: LocalStorageService,
               private router: Router,
               ){}
               public edit:any;
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "kardex")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.purchaseOrdersService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.purchaseOrder = resp.purchaseOrder;
        this.isLoading = false;
      });
  }

  openModal() {
    this.modalService.openModal();
  }



  async downloadPDF() {
    const resp = await this.purchaseOrdersService.downloadPDF( +this.purchaseOrder.id );
    window.open(`${this.fileUrl}/uploads/docs/purchaseOrders/${resp.pdfName}`, '_blank');
  }


  goToBack() {
    this.location.back();
  }


}
