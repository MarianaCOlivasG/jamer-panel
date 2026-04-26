import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { WorkOrdersSolutionsService } from '../../services/work-orders-solutions.service';
import { WorkOrderSolution } from '../../interfaces/work-order-solution.interface';
import lgZoom from 'lightgallery/plugins/zoom';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import { environment } from 'src/environments/environment.development';
import { LightGallery } from 'lightgallery/lightgallery';
import { CustomersPaymentsService } from 'src/app/dashboard/customers/services/payments.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

const baseUrl = environment.apiUrl;

@Component({
  selector: 'work-solution',
  templateUrl: './work-solution.component.html',
  styleUrls: ['./work-solution.component.scss']
})
export class WorkSolutionComponent implements OnInit, AfterViewChecked {
  @Input() workOrderId!: number | string;

  private lightGallery!: LightGallery;
  private needRefresh = false;

  public isLoading = true;
  public workOrderSolution!: WorkOrderSolution;

  public base64Image = '';

  public workerSignature = '';

  public sanitarySignature = '';

  public settings = {
    counter: false,
    plugins: [lgZoom]
  };

  public items: any[] = [];
  public pays: any[] = [];

  public create: any;
  public edit: any;
  public deleted: any;

  constructor(
    private workOrdersSolutionsService: WorkOrdersSolutionsService,
    private customersPaymentsService: CustomersPaymentsService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');
    const permissions = storedPermissions?.find((p) => p.page === 'work orders')?.permissions;

    if (!permissions || ((permissions as number) >> 0) % 2 !== 1) {
      this.router.navigate(['/calendar/my-calendar']);
    }

    this.create = ((permissions as number) >> 1) % 2 === 1;
    this.edit = ((permissions as number) >> 2) % 2 === 1;
    this.deleted = ((permissions as number) >> 3) % 2 === 1;

    this.isLoading = true;
    this.workOrdersSolutionsService.getById(+this.workOrderId).subscribe((resp) => {
      this.workOrderSolution = resp.workOrderSolution;

      if (this.workOrderSolution.signature) {
        this.base64Image = atob(this.workOrderSolution.signature);
       // console.log(this.base64Image);
      }
      if (this.workOrderSolution.worker_signature) {
        this.workerSignature = atob(this.workOrderSolution.worker_signature);
      }
      if (this.workOrderSolution.sanitary_signature) {
        
        this.sanitarySignature = atob(this.workOrderSolution.sanitary_signature);
      }
    
      this.mapImagesGallery(this.workOrderSolution.images);
      this.getPayments(+this.workOrderId);
      this.isLoading = false;
    });
  }

  ngAfterViewChecked(): void {
    if (this.needRefresh) {
      this.lightGallery.refresh();
      this.needRefresh = false;
    }
  }

  public onBeforeSlide = (detail: BeforeSlideDetail): void => {
    const { index, prevIndex } = detail;
  };

  public onInit = (detail: any): void => {
    this.lightGallery = detail.instance;
  };

  mapImagesGallery(images: string[]): void {
    images.forEach((image, index) => {
      this.items.push({
        id: String(index + 1),
        size: '1400-933',
        src: `${baseUrl}/uploads/file/workOrders/${image}`,
        subHtml: ``,
        thumb: `${baseUrl}/uploads/file/workOrders/${image}`
      });
    });
  }

  getPayments(workOrderId: number): void {
    this.customersPaymentsService.getPaysCustomersWorkOrder(workOrderId).subscribe((resp) => {
      this.pays = resp.pays;
    });
  }

  private bufferToBase64(buffer: any): string {
    if (!buffer) return '';
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:image/png;base64,' + btoa(binary);
  }
}