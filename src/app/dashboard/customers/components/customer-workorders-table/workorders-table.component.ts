import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { WorkOrder } from 'src/app/dashboard/work-orders/interfaces/work-order.interface';
import { WorkOrdersService } from 'src/app/dashboard/work-orders/services/work-orders.service';
import { C } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'workorders-table',
  templateUrl: './workorders-table.component.html',
  styleUrls: ['./workorders-table.component.scss']
})
export class WorkordersTableComponent implements OnInit {
  @Output() totalResultsEvent = new EventEmitter<number>();
  @Input() customerId: number = 0;
  @Input() isBudget: boolean = false;
  public employeesIds: string = "";
  public statusId: number = 0;
  public date: string = "";
  public isValidated: number = 2;

  public workOrders: WorkOrder[] = [];
  public isLoading: boolean = true;

  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 999;

  public isSuggestions: boolean = false;
  public querySearch: string = "";

  public create: any;

  constructor(
    private workOrdersService: WorkOrdersService,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(({ id }) => {
      if (!this.customerId) {
        this.customerId = +id;
      }
      this.getAll(this.currentPage, this.limit, this.employeesIds, this.customerId, this.statusId, this.date, this.isValidated);
    });
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "budgets")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
  }

  getAll(
    page: number,
    limit: number,
    employeesIds: string,
    customerId: number,
    statusId: number,
    date: string,
    isValidated: number
  ): void {
    this.isLoading = true;
    this.workOrdersService.getAll(page, limit, employeesIds, customerId, statusId, date, isValidated).subscribe({
      next: (resp: any) => {
        resp.workOrders = resp.workOrders.filter((workOrder: WorkOrder) => workOrder.isBudget === this.isBudget);
        this.workOrders = resp.workOrders;
        resp.totalResults = resp.workOrders.length;

       
        this.totalResults = resp.totalResults;
        this.totalResultsEvent.emit(this.totalResults);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  searchWorkOrders(
    page: number,
    limit: number,
    queryString: string,
    employeesIds: string,
    customerId: number,
    statusId: number,
    date: string,
    isValidated: number
  ): void {
    this.isLoading = true;
    this.workOrdersService.search(page, limit, queryString, employeesIds, customerId, statusId, date, isValidated).subscribe({
      next: (resp: any) => {
        resp.workOrders = resp.workOrders.filter((workOrder: WorkOrder) => workOrder.isBudget === this.isBudget);
        this.workOrders = resp.workOrders;
        resp.totalResults = resp.workOrders.length;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  search(query: string): void {
    this.currentPage = 1;
    if (query.length === 0) {
      this.isSuggestions = false;
      this.querySearch = "";
      this.getAll(this.currentPage, this.limit, this.employeesIds, this.customerId, this.statusId, this.date, this.isValidated);
      return;
    }
    if (query.trim().length === 0) {
      this.isSuggestions = false;
      return;
    }
    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchWorkOrders(this.currentPage, this.limit, this.querySearch, this.employeesIds, this.customerId, this.statusId, this.date, this.isValidated);
  }

  changePage(currentPage: number): void {
    this.currentPage = currentPage;
    if (!this.isSuggestions) {
      this.getAll(this.currentPage, this.limit, this.employeesIds, this.customerId, this.statusId, this.date, this.isValidated);
    } else {
      this.searchWorkOrders(this.currentPage, this.limit, this.querySearch, this.employeesIds, this.customerId, this.statusId, this.date, this.isValidated);
    }
  }

  changeModel(formName: string): void {
    this.currentPage = 1;
    this.isSuggestions = false;
    switch (formName) {
      case 'customerId':
        this.getAll(this.currentPage, this.limit, this.employeesIds, this.customerId, this.statusId, this.date, this.isValidated);
        break;
      default:
        break;
    }
  }

  goToCreateWorkOrder(): void {
 //   this.workOrdersService.customerIdSelected = this.customerId;
    this.router.navigateByUrl('/customers/workorders/new');
  }
}