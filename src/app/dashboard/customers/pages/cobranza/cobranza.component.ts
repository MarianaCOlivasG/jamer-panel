import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { CustomersService } from '../../services/customers.service';
import { CustomersPaymentsService } from '../../services/payments.service';
import * as moment from 'moment-timezone';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { Customer } from '../../interfaces';
import { environment } from 'src/environments/environment.development';
import { BalanceCustomer } from 'src/app/dashboard/suppliers/interfaces/balance-customers.interface';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-cobranza',
  templateUrl: './cobranza.component.html',
  styleUrls: ['./cobranza.component.scss']
})
export class CobranzaComponent implements OnInit {
  public fileUrl: string = environment.apiUrl;
  public isLoading: boolean = true;
  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 10;

  public months: any[] = [
    { sigla: '01', label: 'Enero' },
    { sigla: '02', label: 'Febrero' },
    { sigla: '03', label: 'Marzo' },
    { sigla: '04', label: 'Abril' },
    { sigla: '05', label: 'Mayo' },
    { sigla: '06', label: 'Junio' },
    { sigla: '07', label: 'Julio' },
    { sigla: '08', label: 'Agosto' },
    { sigla: '09', label: 'Septiembre' },
    { sigla: '10', label: 'Octubre' },
    { sigla: '11', label: 'Noviembre' },
    { sigla: '12', label: 'Diciembre' }
  ];

  public years: number[] = [];
  public yearSelected: number = 0;
  public balance: any[] = [];
  public monthlyCuts: any[] = []; 
  public workOrderFolioSelect: string = '';
  public bWorkOrderSelected: any;
  public balanceSelected: number = 0;
  public documentType: 'R' | 'F' = 'R';
  public customers: MultiSelectData[] = [];
  public customerSelected: any = [];

  public selectedStartMonth: string = '01';
  public selectedEndMonth: string = '12';
  public rangeTotals: { totalWorkOrders: number; totalPayments: number; netTotal: number } = {
    totalWorkOrders: 0,
    totalPayments: 0,
    netTotal: 0
  };

  public toNumber: typeof Number = Number;

  public edit: any;
  public editingPayment: boolean = false;
  public selectedPayment: any;

  public dropdownSettingsSingle = {
    enableSearchFilter: true,
    singleSelection: true,
    text: "Selecciona cliente",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar'
  };

  constructor(
    private customerService: CustomersService,
    private paymentsService: CustomersPaymentsService,
    public modalService: ModalService,
    public activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');
    const permissions = (storedPermissions?.find((p) => p.page == "payment")?.permissions);
    ((permissions as number >> 0) % 2 === 1) ? true : this.router.navigate(['/calendar/my-calendar']);
    this.edit = ((permissions as number >> 2) % 2 === 1) ? true : false;
    for (let anio = 2000; anio <= moment(Date.now()).get('year'); anio++) {
      this.years.push(anio);
    }
    this.yearSelected = moment(Date.now()).get('year');
    this.getCustomers();
    this.activatedRoute.params.subscribe(({ documentType }) => {
      this.getBalance(documentType);
      this.documentType = documentType;
    });
  }

  getCustomers() {
    this.isLoading = true;
    this.customerService.getAllWithoutPagination().subscribe({
      next: (resp: any) => {
        this.customers = this.tranformData(resp.customers);
        this.customerSelected = [];
        this.getBalance(this.documentType);
      }
    });
  }

  tranformData(customers: Customer[]): MultiSelectData[] {
    return customers.map(c => {
      return {
        id: c.id,
        itemName: c.name
      };
    });
  }

  getBalance(documentType: 'R' | 'F') {
    this.isLoading = true;
    this.paymentsService.getBalance(this.currentPage, this.limit, this.yearSelected, documentType, this.customerSelected[0]?.id)
      .subscribe({
        next: (resp: any) => {
          this.balance = this.mapBalance(resp.balance);
          this.totalResults = resp.totalResults;
          this.computeMonthlyCuts(); 
          this.computeRangeTotals(); 
          this.isLoading = false;
        }
      });
  }

  mapBalance(balance: BalanceCustomer[]) {
    return balance.map((item, idx) => {
      if (item.concept === 'payment') {
        if (idx === 0) {
          item.balance = item.amount;
        } else {
          if (balance[idx - 1].concept === 'workOrder') {
            item.balance = (Number(balance[idx - 1].balance) - Number(item.amount));
          } else if (balance[idx - 1].concept === 'payment') {
            item.balance = (Number(balance[idx - 1].balance) - Number(item.amount));
          }
        }
      } else if (item.concept === 'workOrder') {
        if (idx === 0) {
          item.balance = item.amount;
        } else {
          if (balance[idx - 1].concept === 'workOrder') {
            item.balance = (Number(balance[idx - 1].balance) + Number(item.amount));
          } else if (balance[idx - 1].concept === 'payment') {
            item.balance = (Number(balance[idx - 1].balance) + Number(item.amount));
          }
        }
      }
      return item;
    });
  }

  computeMonthlyCuts() {
    let cuts = this.months.map(m => {
      const itemsForMonth = this.balance.filter(item => {
        const monthForItem = (item.concept === 'payment' && item.paymentAt)
          ? moment(item.paymentAt).format('MM')
          : moment(item.createdAt).format('MM');
        return monthForItem === m.sigla;
      });
      const totalWorkOrders = itemsForMonth
        .filter(item => item.concept === 'workOrder')
        .reduce((sum, item) => sum + Number(item.amount), 0);
      const totalPayments = itemsForMonth
        .filter(item => item.concept === 'payment')
        .reduce((sum, item) => sum + Number(item.amount), 0);
      return {
        monthSigla: m.sigla,
        monthLabel: m.label,
        totalWorkOrders,
        totalPayments,
        net: totalWorkOrders - totalPayments,  
        cumulative: 0  
      };
    })
    .filter(corte => corte.totalWorkOrders !== 0 || corte.totalPayments !== 0);

    cuts.sort((a, b) => a.monthSigla.localeCompare(b.monthSigla));

    let runningTotal = 0;
    cuts.forEach(corte => {
      runningTotal += corte.net;
      corte.cumulative = runningTotal;
    });
    this.monthlyCuts = cuts;
  }

  computeRangeTotals() {
    const start = this.toNumber(this.selectedStartMonth);
    const end = this.toNumber(this.selectedEndMonth);
    // Filtrar los cortes incluidos en el rango seleccionado.
    const selectedCuts = this.monthlyCuts.filter(corte => {
      const monthNumber = this.toNumber(corte.monthSigla);
      return monthNumber >= start && monthNumber <= end;
    });
    // Totales para el rango seleccionado.
    const totalWorkOrders = selectedCuts.reduce((sum, corte) => sum + corte.totalWorkOrders, 0);
    const totalPayments = selectedCuts.reduce((sum, corte) => sum + corte.totalPayments, 0);
    const netTotal = totalWorkOrders - totalPayments;
    this.rangeTotals = { totalWorkOrders, totalPayments, netTotal };
  
    let cumulative = 0;
    this.monthlyCuts.forEach(corte => {
      const monthNumber = this.toNumber(corte.monthSigla);
      if (monthNumber >= start && monthNumber <= end) {
        cumulative += corte.net;
        corte.cumulativeRange = cumulative;
      } else {
        corte.cumulativeRange = null;
      }
    });
  }

  onRangeChange() {
    this.computeRangeTotals();
  }

  getMonthLabel(sigla: string): string {
    const month = this.months.find(m => m.sigla === sigla);
    return month ? month.label : sigla;
  }

  addPayment(item: any) {
    if (item.concept === 'workOrder') {
      this.workOrderFolioSelect = item.workOrder.folio;
      this.bWorkOrderSelected = item;
      const pays = this.balance.filter(b => b.concept === 'payment' && b.bWorkOrderId == this.bWorkOrderSelected.id);
      this.balanceSelected = pays.length > 0 ? +pays[pays.length - 1].balance : +item.balance;
      this.editingPayment = false;
      this.modalService.openModal();
    } else if (item.concept === 'payment') {
      this.selectedPayment = item;
      this.editingPayment = true;
      this.modalService.openModal();
    }
  }

  newPaymentEvent() {
    this.currentPage = 1;
    this.getBalance(this.documentType);
  }

  editPaymentEvent() {
    this.editingPayment = false;
    this.currentPage = 1;
    this.getBalance(this.documentType);
  }

  onYearChange() {
    this.currentPage = 1;
    this.getBalance(this.documentType);
  }

  onItemSelect(event: any) {
    this.currentPage = 1;
    this.getBalance(this.documentType);
  }

  OnItemDeSelect(event: any) {
    this.getBalance(this.documentType);
  }

  onSelectAll(event: any) {
    console.log(event);
  }

  onDeSelectAll(event: any) {
    this.getBalance(this.documentType);
  }

  exportToExcel() {
    this.paymentsService.exportToExcel(this.yearSelected, this.documentType, this.customerSelected[0]?.id, 'cobranza-servicios')
      .subscribe({
        next: (resp) => {
          const path = `${this.fileUrl}/uploads/docs/balancesCustomer/${resp.fileName}`;
          window.open(path, '_blank');
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
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
        }
      });
  }
}