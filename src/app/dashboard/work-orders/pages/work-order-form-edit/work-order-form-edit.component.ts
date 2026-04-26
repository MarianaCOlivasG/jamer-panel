import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap, fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'app-work-order-form-edit',
  templateUrl: './work-order-form-edit.component.html',
  styleUrls: ['./work-order-form-edit.component.scss']
})
export class WorkOrderFormEditComponent implements OnInit, OnDestroy {
  public productsSelectedContract: Product[] = [];
  public productsSelectedSale: Product[] = [];
  public workOrder!: WorkOrder;
  public contractIdPassed: number | null = null;
  public WorkId: number = 0;
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isWithContract = true;
  totalImpuestos: number = 0;
  totalBaseGravable: number = 0;
  totalImpuesto: number = 0;
  total: number = 0;
  public form: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    contractId: [null],
    addressId: [[], Validators.required],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    finalDate: ['', Validators.required],
    finalTime: ['', Validators.required],
    typeWork: ['contract', Validators.required],
    description: [''],
    statusId: ['5', Validators.required],
    employeesIds: [[]],
    facturaOrRemision: ['R', Validators.required],
    noFactura: [''],
    isVisible: [false, Validators.required],
  });
  public customers: Customer[] = [];
  public addresses: MultiSelectData[] = [];
  public contracts: MultiSelectData[] = [];
  public businessLines: BusinessLine[] = [];
  public employees: MultiSelectData[] = [];
  public contractSelected!: Contract | null | number;
  public contractsProducts: {
    checked: boolean;
    amount: number;
    name: string;
    htmlDescription: string;
    total: number;
    totalWithIva: number;
    id: number
  }[] = [];
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
  public productsSelected: any[] = [];
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
  private budgetId: string = '';
  public isBud: boolean = true;
  public rout: boolean = false;
  private destroy$ = new Subject<void>();
  ngOnInit(): void {
    
    this.activatedRoute.params.subscribe(({ id }) => {
      this.WorkId = id;
    });
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');
    const permissions = storedPermissions?.find((p) => p.page == 'work orders')?.permissions;
    ((permissions as number) >> 2) % 2 == 1 || ((permissions as number) >> 1) % 2 == 1
      ? true
      : this.router.navigate(['/calendar/my-calendar']);
    combineLatest([
      this.customersService.getAllWithoutPagination(),
      this.businessLinesService.getAllWithoutPagination(),
      this.employeesService.getTechnicalsWithoutPagination()
    ]).subscribe((combined) => {
      this.customers = combined[0].customers;
      this.businessLines = combined[1].businessLines;
      this.employees = combined[2];
    });
    this.activatedRoute.queryParams.subscribe((params) => {
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
        this.isWithContract = true;
        this.getContract(this.contractIdPassed);
      }
      this.budgetId = params['budgetId'];
      if (this.budgetId) {
        this.isBudget = false;
        this.loadProductsFromBudget(Number(this.budgetId));
      }
    });
    if (!this.router.url.includes('edit')) {
      return;
    }
    this.isLoading = true;
    this.activatedRoute.params
      .pipe(switchMap(({ id }) => this.workOrdersService.getById(id)))
      .subscribe((resp: any) => {
        this.workOrder = resp.workOrder;
        const {
          customerId,
          startDate,
          startTime,
          finalDate,
          finalTime,
          statusId,
          description,
          facturaOrRemision,
          noFactura,
          isWithContract,
          contractId: idContact,
          isVisible
        } = this.workOrder;
        this.isBud = this.workOrder.isBudget;
        this.isWithContract = isWithContract;
        this.form.get('isVisible')?.setValue(isVisible);
        this.form.get('typeWork')?.setValue(isWithContract ? 'contract' : 'contract-sale');
        this.getAddressByCustomerId(this.workOrder.customerId);
        this.getContractsByCustomerIdWithoutPagination(this.workOrder.customerId);
        const contractId = isWithContract ? this.transformContracts([this.workOrder.contract]) : [];
        const addressId = this.transformAddress([this.workOrder.address]);
        this.form.setValue({
          ...this.form.value,
          customerId,
          contractId,
          addressId,
          startDate: this.datePipe.transform(startDate, 'yyyy-MM-dd'),
          startTime,
          finalDate: this.datePipe.transform(finalDate, 'yyyy-MM-dd'),
          finalTime,
          description,
          statusId,
          employeesIds: [],
          facturaOrRemision,
          noFactura,
          typeWork: isWithContract ? 'contract' : 'contract-sale'
        });
        this.form.get('customerId')?.disable();
        this.form.get('typeWork')?.disable();
        this.form.get('facturaOrRemision')?.disable();
        if (isWithContract) {
          this.contractsProducts = [];
          this.getContract(contractId[0].id as number);
          this.isLoading = false;
          return;
        }
        this.contractSelected = 0;
        this.form.get('contractId')?.setValue('');
        this.form.get('contractId')?.setValidators([]);
        this.form.get('contractId')?.updateValueAndValidity();
        this.productsSelected = this.workOrder.workOrdersContractProducts.map((wcp: any) => {
          const { amount, unitPrice, product, showDescription, id, htmlDescription } = wcp.contractProduct;
          return {
            ...product,
            priceSale: unitPrice,
            amount,
            showDescription,
            contractProductId: id,
            htmlDescription,
            showHtmlDescription: wcp.contractProduct.showHtmlDescription ? wcp.contractProduct.showHtmlDescription : false
          };
        });
        this.isLoading = false;
        this.onSelect();
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadProductsFromBudget(budgetId: number) {
    this.budgetsService.getById(budgetId).subscribe({
      next: (resp) => {
        const budget = resp.budget;
        if (budget) {
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
                htmlDescription: bp.htmlDescription
              };
            });
          }
          if (budget.addresses && budget.addresses.length > 0) {
            this.addresses = this.transformAddress(budget.addresses);
            this.form.patchValue({ addressId: [this.addresses[0]] });
          }
        }
      },
      error: () => {}
    });
  }
  public modalSelected: 'assign' | 'cancel' | 'emails' | '' = '';
  public workOrderSelected: WorkOrder | null = null;
  public currentTechnicals: number[] = [];
  openModal(workOrder: WorkOrder, modalSelected: 'assign' | 'cancel') {
    this.modalSelected = modalSelected;
    this.workOrderSelected = workOrder;
    this.currentTechnicals = workOrder.employees.map((employee) => employee.id);
  }
  closeModal() {
    this.modalSelected = '';
    this.workOrderSelected = null;
  }
  async handleSubmit() {
    this.formSubmitted = true;
    if (this.form.invalid) return;
    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se actualizará la información de la orden de trabajo',
      confirmButtonText: '¡Si, actualizar',
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });
    if (!isConfirmed) return;
    this.isSaving = true;
    this.update();
  }
  getCustomerName(customerId: number): string {
    const customer = this.customers.find((c) => c.id === customerId);
    return customer ? `${customer.name} ${customer.lastName}` : '';
  }
  async update() {
    const productsEdits = this.productsSelected.map((ps) => {
      return {
        id: ps.id,
        amount: ps.amount,
        showDescription: ps.showDescription,
        priceSale: ps.priceSale,
        contractProductId: ps.contractProductId ? ps.contractProductId : null,
        htmlDescription: ps.htmlDescription,
        showHtmlDescription: ps.showHtmlDescription ? ps.showHtmlDescription : false
      };
    });
    if (this.contractSelected == 0) {
      const formData = {
        ...this.form.value,
        id: this.workOrder.id,
        addressId: this.form.get('addressId')?.value[0]['id'],
        productsEdits,
        contractId: null
      };
      this.socketsRouteService.updateWorkOrderWithoutContract( formData )
      .subscribe({
        next: (resp) => {
          this.isSaving = false;
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.router.navigate(['/work-orders/details', resp.workOrder.id]);
        },
        error: (error) => {
          this.isSaving = false;
          Swal.fire({
            text: error.error.message || 'Error al actualizar la orden de trabajo.',
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      });
    } else {
      const formData = {
        ...this.form.value,
        id: this.workOrder.id,
        contractId:
          this.form.get('contractId')?.value != ''
            ? this.form.get('contractId')?.value[0].id
            : null,
        addressId: this.form.get('addressId')?.value[0]['id'],
        productsEdits
      };

      this.socketsRouteService.updateWorkOrder(formData)
      .subscribe({
        next: (resp) => {
          this.isSaving = false;
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.router.navigate(['/work-orders/details', resp.workOrder.id]);
        },
        error: (error) => {
          this.isSaving = false;
          Swal.fire({
            text: error.error.message || 'Error al actualizar la orden de trabajo.',
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
  assingToEvent() {
    this.activatedRoute.params
      .pipe(switchMap(({ id }) => this.workOrdersService.getById(id)))
      .subscribe((resp: any) => {
        this.workOrder = resp.workOrder;
        this.currentTechnicals = this.workOrder.employees.map((employee) => employee.id);
      });
    this.workOrderSelected = null;
  }
  inputInvalid(campo: string): boolean {
    if (this.form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }
  errorMessage(campo: string): string {
    return this.form.get(campo)?.hasError('required')
      ? 'Este campo es requerido.'
      : this.form.get(campo)?.hasError('email')
      ? 'Correo electrónico inválido.'
      : this.form.get(campo)?.hasError('minlength')
      ? `Mínimo ${this.form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.`
      : this.form.get(campo)?.hasError('maxlength')
      ? `Máximo ${this.form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.`
      : '';
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
          this.contractsService.getById(selectedContractId).subscribe((resp) => {
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
    this.customersService.getAllAddressByCustomerIdWithoutPagination(customerId).subscribe({
      next: (resp) => {
        this.addresses = this.transformAddress(resp.addresses);
      }
    });
  }
  getContractsByCustomerIdWithoutPagination(customerId: number) {
    this.contractsService.getAllByCustomerIdWithoutPagination(customerId).subscribe({
      next: (resp: any) => {
        this.contracts = this.transformContracts([...resp.contracts]);
      }
    });
  }
  private transformContracts(contracts: Contract[]): MultiSelectData[] {
    return contracts.map((contract) => {
      return { id: contract.id, itemName: contract.folio };
    });
  }
  private transformAddress(addresses: Address[]): MultiSelectData[] {
    return addresses.map((address) => {
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
  OnItemDeSelect(formName: string) {
    if (formName != 'contact') return;
    this.contractsProducts = [];
    this.contractSelected = null;
  }
  onSelectAll(items: any) {}
  onDeSelectAll(formName: string) {
    if (formName == 'contact') {
      this.contractsProducts = [];
      this.contractSelected = null;
    }
  }
  getContract(contractId: number) {
    this.contractsService.getById(contractId).subscribe({
      next: (resp) => {
        this.contractSelected = resp.contract;
        if (this.rout == true) {
          this.form.patchValue({ customerId: (this.contractSelected as Contract).customerId });
          this.getAddressByCustomerId((this.contractSelected as Contract).customerId);
        }
        this.workOrder?.workOrdersContractProducts.forEach((wcp) => {
          const { contractProduct } = wcp;
          this.productsSelected.push({
            checked: false,
            amount: wcp.amount,
            name: contractProduct.product.name,
            htmlDescription: contractProduct.htmlDescription,
            priceSale: contractProduct.unitPrice,
            totalWithIva: contractProduct.unitPrice * (1 + 0.16),
            id: contractProduct.product.id,
            showDescription: contractProduct.showDescription,
            contractProductId: contractProduct.id
          });
        });
        this.getTotalToPay();
      }
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
  onSelect(): void {
    setTimeout(() => {
      this.getTotalToPay();
    });
  }
  getTotalToPay(): number {
    let total = 0;
    this.totalBaseGravable = 0;
    this.totalImpuesto = 0;
    this.totalBaseGravable = 0;
    this.productsSelected.forEach((item) => {
      item.totalWithIva = item.priceSale * (1 + 0.16);
      total = total + Number(item.totalWithIva) * Number(item.amount);
      this.totalBaseGravable =
        this.totalBaseGravable +
        (item.totalWithIva - (16 * Number(item.totalWithIva)) / 116) * Number(item.amount);
      this.totalImpuesto =
        this.totalImpuesto +
        ((16 * Number(item.totalWithIva)) / 116) * Number(item.amount);
    });
    this.total = total;
    return total;
  }
  messageErrorServices(): string {
    return this.formSubmitted &&
      this.contractsProducts.filter((item) => item.checked).length == 0
      ? 'Almenos un servicio es requerido.'
      : '';
  }
  getServices() {
    this.contractSelected = 0;
    this.productsService.getAllOnSale(undefined, undefined, undefined, undefined, 2).subscribe({
      next: (resp) => {
        this.products = resp['products'];
      }
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
    this.getTotalToPay();
  }
  addProductToList(idx: number) {
    const exist = this.productsSelected.find((ps) => ps.id == this.products[idx].id);
    if (exist) {
      exist.amount = exist.amount + this.products[idx].amount;
      this.products[idx].amount = 0;
      this.getTotalToPay();
      return;
    }
    this.productsSelected.push({ ...this.products[idx] });
    this.products[idx].amount = 0;
    this.getTotalToPay();
    this.products = [];
    this.totalResults = 0;
    this.inputSearchComponent.resetValueInput();
  }
  searchProducts() {
    this.isLoadingProducts = true;
    this.productsService
      .searchOnSale(this.currentPage, this.limit, this.querySearch)
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