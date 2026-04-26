import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BusinessLine, Product } from 'src/app/dashboard/catalogue/interfaces';
import { BusinessLinesService } from 'src/app/dashboard/catalogue/services/business-lines.service';
import { Customer } from 'src/app/dashboard/customers/interfaces';
import { Address } from 'src/app/dashboard/customers/interfaces/address.interface';
import { CustomersService } from 'src/app/dashboard/customers/services/customers.service';
import Swal from 'sweetalert2';
import { WorkOrdersService } from '../../services/work-orders.service';
import { WorkOrder } from '../../interfaces/work-order.interface';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { EmployeesService } from 'src/app/dashboard/employees/services/employees.service';
import { Contract } from 'src/app/dashboard/customers/interfaces/contract.interface';
import { ContractsService } from 'src/app/dashboard/customers/services/contracts.service';
import { DatePipe, Location } from '@angular/common';
import { ProductsService } from 'src/app/dashboard/catalogue/services/products.service';
import { InputSearchComponent } from 'src/app/shared/components/input-search/input-search.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { BudgetsService } from 'src/app/dashboard/customers/services/budgets.service';
import { Budget } from 'src/app/dashboard/customers/interfaces/budget.interface';
import { ContractProduct } from 'src/app/dashboard/customers/interfaces/contract-product.interface';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'app-work-order-form',
  templateUrl: './work-order-form.component.html',
  styleUrls: ['./work-order-form.component.scss']
})
export class WorkOrderFormComponent implements OnInit {
  public productsSelectedContract: Product[] = [];
  public productsSelectedSale: Product[] = [];
  private workOrder!: WorkOrder;
  public contractIdPassed: number | null = null;
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  private socketResponseHandler: any;

  dateTimeValidator: ValidatorFn = (group: AbstractControl): {[key: string]: any} | null => {
    const startDate = group.get('startDate')?.value;
    const startTime = group.get('startTime')?.value;
    const finalDate = group.get('finalDate')?.value;
    const finalTime = group.get('finalTime')?.value;
    if (startDate && startTime && finalDate && finalTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${finalDate}T${finalTime}`);
      return end < start ? { dateTime: 'La fecha y hora de término no pueden ser anteriores a la fecha y hora de inicio.' } : null;
    }
    return null;
  };

  public form: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    contractId: [null],
    addressId: [[], Validators.required],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    finalDate: ['', Validators.required],
    finalTime: ['', Validators.required],
    typeWork: ['contract-sale', Validators.required],
    description: [''],
    statusId: ['5', Validators.required],
    employeesIds: [[]],
    facturaOrRemision: ['R', Validators.required],
    noFactura: [''],
    isVisible: [false, Validators.required],
    isBudget: [true, Validators.required],
  }, { validators: this.dateTimeValidator });

  public customers: Customer[] = [];
  public addresses: MultiSelectData[] = [];
  public contracts: MultiSelectData[] = [];
  public businessLines: BusinessLine[] = [];
  public employees: MultiSelectData[] = [];
  public customerSearchQuery: string = '';
  public showCustomerDropdown: boolean = false;
  public filteredCustomers: Customer[] = [];
  public contractSelected: Contract | null | number = 0;
  public contractsProducts: {
    woId: string;
    checked: boolean;
    amount: number;
    name: string;
    htmlDescription: string;
    total: number;
    totalWithIva: number;
    id: number;
    assignedToWorkOrder: boolean;
    workOrderFolio: string;
    assignedTo: string;
    workOrderStatus: string;
  }[] = [];
  private workOrders: WorkOrder[] = [];
  public selectAll: boolean = false;
  public totalImpuestos: number = 0;
  public totalBaseGravable: number = 0;
  public totalImpuesto: number = 0;
  public total: number = 0;
  public dropdownSettings = {
    enableSearchFilter: true,
    singleSelection: false,
    text: 'Seleccionar técnicos',
    selectAllText: 'Seleccionar todos',
    unSelectAllText: 'Quitar todos',
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
    filterSelectAllText: 'Seleccionar todos los resultados',
    filterUnSelectAllText: 'Quitar todos los resultados'
  };
  public dropdownSettingsSingle = {
    enableSearchFilter: true,
    singleSelection: true,
    text: 'Selecciona una opción',
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  };
  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 5;
  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public isLoadingProducts: boolean = false;
  public productsSelected: Product[] = [];
  public productSelected!: Product | null;
  public products: Product[] = [];
  @ViewChild(InputSearchComponent) inputSearchComponent!: InputSearchComponent;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private workOrdersService: WorkOrdersService,
    private customersService: CustomersService,
    private productsService: ProductsService,
    private contractsService: ContractsService,
    private businessLinesService: BusinessLinesService,
    private socketsRouteService: SocketsRouteService,
    private authService: AuthService,
    private employeesService: EmployeesService,
    private datePipe: DatePipe,
    public modalService: ModalService,
    private location: Location,
    private localStorageService: LocalStorageService,
    private budgetsService: BudgetsService
  ) {}

  public isBudget: boolean = true;
  public budgetId: string = '';
  private clientId: string = '';
  public rout: boolean = false;

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');
    const permissions = (storedPermissions?.find((p) => p.page == 'work orders')?.permissions);
    ((permissions as number >> 2) % 2 == 1 || ((permissions as number >> 1) % 2 == 1)) ? true : this.router.navigate(['/calendar/my-calendar']);

    this.handleOnResponse();

    combineLatest([
      this.customersService.getAllWithoutPagination(),
      this.businessLinesService.getAllWithoutPagination(),
      this.employeesService.getTechnicalsWithoutPagination(),
    ])
    .subscribe(combined => {
      this.customers = combined[0].customers.sort((a: any, b: any) => a.name.localeCompare(b.name));
      this.filteredCustomers = [...this.customers];

      this.activatedRoute.queryParams.subscribe(params => {
        this.clientId = params['clientId'];
        if (this.clientId) {
          this.selectCustomer(this.customers.find(c => c.id == parseInt(this.clientId)));
          this.isDisabled = true;
        }
      });

      this.businessLines = combined[1].businessLines;
      this.employees = combined[2];
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const typeWork = params['typeWork'];
      if (typeWork) {
        this.form.patchValue({ typeWork: typeWork });
        this.contractsProducts = [];
      }
      const contractId = params['contractId'];
      if (contractId) {
        this.rout = true;
        this.contractIdPassed = Number(contractId);
        this.form.patchValue({ contractId: [this.contractIdPassed] });
        this.form.get('contractId')?.disable();
        this.getContract(this.contractIdPassed);
      }
      this.budgetId = params['budgetId'];
      if (this.budgetId) {
        this.isBudget = false;
        this.loadProductsFromBudget(Number(this.budgetId));
        this.form.patchValue({ isBudget: false });
      }
      this.clientId = params['clientId'];
      if (this.clientId) {
        this.form.patchValue({ customerId: Number(this.clientId) });
        this.form.patchValue({ isBudget: true });
        this.form.get('customerId')?.disable();
        this.onChange('customerId');
      }
    });
  }

  searchCustomer(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    if (query.length === 0) {
      this.filteredCustomers = [...this.customers];
    } else {
      const queryParts = query.split(/\s+/).filter(part => part);
      this.filteredCustomers = this.customers.filter(customer => {
        const fullName = (customer.name + ' ' + (customer.lastName || '')).toLowerCase();
        return queryParts.every(part => fullName.includes(part));
      });
    }
    this.showCustomerDropdown = true;
  }

  selectCustomer(customer: Customer | undefined): void {
    const customerId = customer ? customer.id : '';
    this.form.get('customerId')?.setValue(customerId);
    this.customerSearchQuery = customer ? `${customer.name} ${customer.lastName}` : '';
    this.showCustomerDropdown = false;
    this.onChange('customerId');
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.showCustomerDropdown = false;
    }
  }

  public isDisabled: boolean = false;

  loadProductsFromBudget(budgetId: number) {
    this.budgetsService.getById(budgetId).subscribe({
      next: (resp) => {
        const budget = resp.budget;
        if (budget) {
          this.selectCustomer(budget.customer);
          this.isDisabled = true;
          this.form.patchValue({ customerId: (budget as Budget).customerId });
          this.form.get('customerId')?.disable();
          this.getAddressByCustomerId(budget.customerId);
          this.form.patchValue({ typeWork: 'contract-sale' });
          this.onChange('typeWork');
          if (budget.budgetsProducts) {
            this.productsSelected = budget.budgetsProducts.map((bp: any) => {
              return {
                ...bp.product,
                amount: bp.amount,
                priceSale: bp.unitPrice,
                showDescription: bp.showDescription,
                htmlDescription: bp.htmlDescription,
                showHtmlDescription:  bp.showDescription
              };
            });
          }
          if (budget.addresses && budget.addresses.length > 0) {
            this.addresses = this.transformAddress(budget.addresses);
            this.form.patchValue({ addressId: [this.addresses[0]] });
          }
          this.getTotalToPaywithouContract();
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {

  }

  handleOnResponse() {
    this.socketResponseHandler = (payload: {status: boolean, message: string, workOrder: any}) => {
      this.isSaving = false;
      if (payload.status) {
        Swal.fire({
          text: payload.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        // Borrar todos los datos del formulario y otras propiedades
        this.form.reset();
        this.formSubmitted = false;
        this.productsSelected = [];
        this.productsSelectedSale = [];
        this.productsSelectedContract = [];
        this.contractsProducts = [];
        this.customerSearchQuery = '';
        this.selectAll = false;
        this.totalImpuestos = 0;
        this.totalBaseGravable = 0;
        this.totalImpuesto = 0;
        this.total = 0;
        // Navegar al detalle de la orden de trabajo
        this.router.navigate(['/work-orders/details', payload.workOrder.id]);

      } else {
        Swal.fire({
          text: payload.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
      }
    };
  }

  async handleSubmit() {
    if (this.isSaving) return;
    if (this.form.get('addressId')?.invalid) {
      Swal.fire({
        text: 'La sede es requerida.',
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
    }
    if (this.form.errors != null) {
      Swal.fire({
        text: this.form.errors['dateTime'],
        icon: 'error',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      });
    }
    this.formSubmitted = true;
    if (this.form.invalid) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se creará una nueva orden de trabajo',
      confirmButtonText: '¡Si, crear!',
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });
    if (!isConfirmed) return;
    this.isSaving = true;
    this.create();
  }

  async create() {
    const isContractWork = this.form.get('typeWork')?.value == 'contract';
    const propName: string = isContractWork ? 'contractsProducts' : 'products';
    const propValue = isContractWork
      ? this.contractsProducts.filter(item => item.checked).map(item => ({ id: item.id }))
      : this.productsSelected.map(ps => ({
          id: ps.id,
          amount: Number(ps.amount),
          priceSale: Number(ps.priceSale),
          showDescription: ps.showDescription,
          htmlDescription: ps?.htmlDescription,
          showHtmlDescription: ps.showHtmlDescription ? ps.showHtmlDescription : false
        }));

    const eventName: string = isContractWork ? 'new-work-order' : 'new-work-order-whitout-contract';
    const formData = {
      ...this.form.value,
      customerId: this.form.get('customerId')?.value,
      employeesIds: this.form.get('employeesIds')?.value != '' ? this.form.get('employeesIds')?.value?.map((employee: MultiSelectData) => employee.id) : null,
      contractId: isContractWork ? (this.contractIdPassed ? this.contractIdPassed : (this.form.get('contractId')?.value != '' ? this.form.get('contractId')?.value[0].id : null)) : null,
      addressId: this.form.get('addressId')?.value[0]['id'],
      totalWithIva: this.getTotalToPay().toLocaleString('es-MX'),
      [propName]: propValue,
      isBudget: this.form.get('isBudget')?.value,
      createdById: this.authService.user.id,
      ...(this.budgetId ? { budgetId: this.budgetId } : {})
    };
    if(eventName == 'new-work-order'){
      this.socketsRouteService.createworkOrder(formData).subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.form.reset();
          this.formSubmitted = false;
          this.productsSelected = [];
          this.productsSelectedSale = [];
          this.productsSelectedContract = [];
          this.contractsProducts = [];
          this.customerSearchQuery = '';
          this.selectAll = false;
          this.totalImpuestos = 0;
          this.totalBaseGravable = 0;
          this.totalImpuesto = 0;
          this.total = 0;
          // Navegar al detalle de la orden de trabajo
          this.router.navigate(['/work-orders/details', resp.workOrder.id]);
  
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
      });
    }else{
      this.socketsRouteService.createWorkOrdeWhitoutContract(formData).subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.form.reset();
          this.formSubmitted = false;
          this.productsSelected = [];
          this.productsSelectedSale = [];
          this.productsSelectedContract = [];
          this.contractsProducts = [];
          this.customerSearchQuery = '';
          this.selectAll = false;
          this.totalImpuestos = 0;
          this.totalBaseGravable = 0;
          this.totalImpuesto = 0;
          this.total = 0;
        
          // Navegar al detalle de la orden de trabajo
          this.router.navigate(['/work-orders/details', resp.workOrder.id]);
  
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
      });
    }

  }

  getCustomerName(customerId: number): string {
    let customer = this.customers.find(c => c.id === customerId);
    if (!customer && this.contractSelected && typeof this.contractSelected !== 'number') {
      const contract = this.contractSelected as Contract;
      if ((contract as any).customer) {
        customer = (contract as any).customer;
      }
    }
    return customer ? `${customer.name} ${customer.lastName}` : '';
  }

  inputInvalid(campo: string): boolean {
    if (this.form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    }
    return false;
  }

  errorMessage(campo: string): string {
    if (this.form.get(campo)?.hasError('dateTime')) {
      return 'La fecha y hora de término no pueden ser anteriores a la fecha y hora de inicio.';
    }
    return this.form.get(campo)?.hasError('required') ? 'Este campo es requerido.' :
      this.form.get(campo)?.hasError('email') ? 'Correo electrónico inválido.' :
      this.form.get(campo)?.hasError('minlength') ? `Mínimo ${this.form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.` :
      this.form.get(campo)?.hasError('maxlength') ? `Máximo ${this.form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.` : '';
  }

  onChange(formName: string) {
    switch (formName) {
      case 'customerId':
        if (this.form.get('customerId')?.value == 0) {
          this.addresses = [];
          this.form.get('addressId')?.setValue([]);
          this.contracts = [];
          this.form.get('contractId')?.setValue([]);
          return;
        }
        this.getAddressByCustomerId(this.form.get('customerId')?.value);
        this.getContractsByCustomerIdWithoutPagination(this.form.get('customerId')?.value);
        this.form.get('addressId')?.setValue([]);
        if (!this.contractIdPassed) {
          this.form.get('contractId')?.setValue([]);
        }
        return;
      case 'typeWork':
        if (this.form.get('typeWork')?.value == 'contract-sale') {
          this.productsSelectedSale = [...this.productsSelected];
          this.productsSelected = [...this.productsSelectedSale];
          if (this.rout == false) {
            this.contractSelected = 0;
            this.form.get('contractId')?.setValue([]);
            this.form.get('contractId')?.clearValidators();
            this.form.get('contractId')?.updateValueAndValidity();
          }
          return;
        } else if (this.form.get('typeWork')?.value == 'contract') {
          this.productsSelectedContract = [...this.productsSelected];
          this.productsSelected = [...this.productsSelectedContract];
          this.form.get('contractId')?.setValidators([Validators.required]);
          this.form.get('contractId')?.updateValueAndValidity();
          return;
        }
        return;
      case 'contractId':
        if (this.form.get('contractId')?.value.length > 0) {
          const selectedContractId = this.form.get('contractId')?.value[0].id;
          this.contractsService.getById(selectedContractId).subscribe(resp => {
            const contract: Contract = resp.contract;
            this.form.patchValue({ customerId: contract.customerId });
            this.getContract(this.form.get('contractId')?.value[0].id);
            this.form.get('customerId')?.disable();
          });
        } else {
          this.form.get('customerId')?.enable();
        }
        return;
      default:
        return;
    }
  }

  getAddressByCustomerId(customerId: number) {
    this.customersService.getAllAddressByCustomerIdWithoutPagination(customerId)
      .subscribe({
        next: (resp) => {
          this.addresses = this.transformAddress(resp.addresses);
        }
      });
  }

  getContractsByCustomerIdWithoutPagination(customerId: number) {
    this.contractsService.getAllByCustomerIdWithoutPagination(customerId)
      .subscribe({
        next: (resp: any) => {
          this.contracts = this.transformContracts([...resp.contracts]);
        }
      });
  }

  private transformContracts(contracts: Contract[]): MultiSelectData[] {
    return contracts.map(contract => {
      return { id: contract.id, itemName: contract.folio };
    });
  }

  private transformAddress(addresses: Address[]): MultiSelectData[] {
    return addresses.map(address => {
      return { id: address.id, itemName: `${address.name} | ${address.address}` };
    });
  }

  onItemSelect(formName: string, item: any) {
    if (formName != 'contact') return;
    if (item.id == 0) {
      this.getServices();
      return;
    }
    this.contractsProducts = [];
    this.getContract(item.id);
  }

  OnItemDeSelect(formName: string, item: any) {
    if (formName != 'contact') return;
    this.contractsProducts = [];
    this.contractSelected = null;
  }

  onSelectAll(items: any) {}

  onSelect(): void {
    setTimeout(() => {
      this.getTotalToPay();
    });
  }

  onSelectwithoutContract(): void {
    setTimeout(() => {
      this.getTotalToPaywithouContract();
    });
  }

  toggleSelectAll(): void {
    this.contractsProducts.forEach(item => {
      if (!item.assignedToWorkOrder) {
        item.checked = this.selectAll;
      }
    });
    this.getTotalToPay();
  }

  onDeSelectAll(formName: string, items: any) {
    if (formName == 'contact') {
      this.contractsProducts = [];
      this.contractSelected = null;
    }
  }

  getContract(contractId: number): void {
    this.workOrdersService.getByContractId(contractId).subscribe({
      next: (resp) => {
        this.workOrders = resp.workOrders;
        this.contractsService.getById(contractId).subscribe({
          next: (respContract) => {
            this.contractSelected = respContract.contract;
            if (this.form.get('customerId')?.value == '') {
              this.form.patchValue({ customerId: (this.contractSelected as Contract).customer.id });
            }
            this.getAddressByCustomerId((this.contractSelected as Contract).customer.id);
            (this.contractSelected as Contract).contractsProducts?.forEach((cp: ContractProduct) => {
              let totalUnits = cp.amount;
              let remainingUnits = totalUnits;
              const usedItems: {
                woId: string;
                amount: number;
                workOrderFolio: string;
                assignedTo: string;
                workOrderStatus: string;
                total: number;
                totalWithIva: number;
              }[] = [];

              this.workOrders.forEach((wo: WorkOrder) => {
                wo.workOrdersContractProducts?.forEach(wocp => {
                  if (wocp.contractProduct && wocp.contractProduct.productId === cp.productId) {
                    usedItems.push({
                      woId: wo.id,
                      amount: wocp.amount,
                      workOrderFolio: wo.folio,
                      assignedTo: (wo.employees && wo.employees.length > 0 ? wo.employees[0].name : ''),
                      workOrderStatus: wo.status ? wo.status.value : '',
                      total: Number(wocp.contractProduct.unitPrice),
                      totalWithIva: Number(wocp.contractProduct.unitPrice) * (1.16)
                    });
                  }
                });
              });

              usedItems.forEach(item => {
                for (let i = 0; i < item.amount; i++) {
                  if (remainingUnits > 0) {
                    this.contractsProducts.push({
                      woId: item.woId,
                      checked: false,
                      amount: 1,
                      name: cp.product.name,
                      htmlDescription: cp.htmlDescription,
                      total: item.total,
                      totalWithIva: item.totalWithIva,
                      id: cp.id,
                      assignedToWorkOrder: true,
                      workOrderFolio: item.workOrderFolio,
                      assignedTo: item.assignedTo,
                      workOrderStatus: item.workOrderStatus
                    });
                    remainingUnits--;
                  }
                }
              });

              while (remainingUnits > 0) {
                this.contractsProducts.push({
                  woId: '',
                  checked: false,
                  amount: 1,
                  name: cp.product.name,
                  htmlDescription: cp.htmlDescription,
                  total: Number(cp.unitPrice),
                  totalWithIva: Number(cp.unitPrice) * (1 + 0.16),
                  id: cp.id,
                  assignedToWorkOrder: false,
                  workOrderFolio: '',
                  assignedTo: '',
                  workOrderStatus: ''
                });
                remainingUnits--;
              }
            });
            this.getTotalToPay();
          },
          error: () => {}
        });
      },
      error: () => {}
    });
  }

  clonarElementoNVeces(element: any, n: number) {
    const result = [];
    for (let i = 0; i < n; i++) {
      result.push({
        checked: false,
        amount: 1,
        name: element.product.name,
        total: Number(element.product.priceSale),
        totalWithIva: Number(element.product.priceSale) + Number(element.product.iva),
        htmlDescription: element.htmlDescription,
        id: element.id
      });
    }
    return result;
  }

  getTotalToPay(): number {
    let total = 0;
    this.totalBaseGravable = 0;
    this.totalImpuesto = 0;
    this.contractsProducts.forEach(item => {
      total += item.checked ? Number(item.totalWithIva) : 0;
      this.totalBaseGravable += item.checked ? (item.totalWithIva - (16 * Number(item.totalWithIva) / 116)) : 0;
      this.totalImpuesto += item.checked ? (16 * Number(item.totalWithIva) / 116) : 0;
    });
    this.total = total;
    return total;
  }

  getTotalToPaywithouContract(): number {
    let total = 0;
    this.totalBaseGravable = 0;
    this.totalImpuesto = 0;
    this.productsSelected.forEach(item => {
      total += Number(item.priceSale) * 1.16 * Number(item.amount);
      this.totalBaseGravable += Number(item.priceSale) * Number(item.amount);
      this.totalImpuesto += Number(item.priceSale) * 0.16 * Number(item.amount);
    });
    this.total = total;
    return total;
  }

  messageErrorServices(): string {
    return (this.formSubmitted && this.contractsProducts.filter(item => item.checked).length == 0) ? 'Almenos un servicio es requerido.' : '';
  }

  getServices() {
    this.contractSelected = 0;
    this.productsService.getAllOnSale(undefined, undefined, undefined, undefined, 2)
      .subscribe(resp => {
        this.products = resp['products'];
      });
  }

  search(query: string): void {
    this.currentPage = 1;
    if (query.length == 0) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.products = [];
      this.totalResults = 0;
      return;
    }
    if (query.trim().length == 0) {
      this.isSuggestions = false;
      return;
    }
    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchProducts();
  }

  removeProductToList(idx: number) {
    this.productsSelected.splice(idx, 1);
    this.onSelectwithoutContract();
  }

  addProductToList(idx: number) {
    const exist = this.productsSelected.find(ps => ps.id == this.products[idx].id);
    if (exist) {
      exist.amount = exist.amount! + this.products[idx].amount!;
      this.products[idx].amount = 0;
      return;
    }
    this.productsSelected.push({...this.products[idx]});
    this.products[idx].amount = 0;
    this.products = [];
    this.totalResults = 0;
    this.inputSearchComponent.resetValueInput();
    this.onSelectwithoutContract();
  }

  searchProducts() {
    this.isLoadingProducts = true;
    this.productsService.searchOnSale(this.currentPage, this.limit, this.querySearch)
      .subscribe({
        next: (resp: any) => {
          this.products = resp.products.map((product: Product) => {
            return {
              ...product,
              amount: 0,
              showDescription: false
            };
          });
          this.totalResults = resp.totalResults;
          this.isLoadingProducts = false;
        }
      });
  }

  newHtmlDescription(htmlDescription: any) {
    this.productSelected!.htmlDescription = htmlDescription;
  }

  openHtmlDescriptionModal(productSelected: Product) {
    this.productSelected = productSelected;
    this.modalService.openModal();
  }

  goToBack() {
    this.location.back();
  }
}