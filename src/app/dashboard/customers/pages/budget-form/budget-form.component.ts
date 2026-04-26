import { Component, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Budget } from '../../interfaces/budget.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import Swal from 'sweetalert2';
import { Customer } from '../../interfaces';
import { CustomersService } from '../../services/customers.service';
import { combineLatest, switchMap } from 'rxjs';
import { Address } from '../../interfaces/address.interface';
import { Product } from 'src/app/dashboard/catalogue/interfaces';
import { ProductsService } from 'src/app/dashboard/catalogue/services/products.service';
import { BudgetsService } from '../../services/budgets.service';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { InputSearchComponent } from 'src/app/shared/components/input-search/input-search.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { WorkTypesService } from '../../services/work-types.service';
import { WorkType } from '../../interfaces/work-type.interface';
import { HtmlDescription } from '../../interfaces/html-description.interface';
import { HtmlDescriptionsGeneralService } from '../../services/html-descriptions-general.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.scss']
})
export class BudgetFormComponent implements OnInit, OnDestroy {
  public budget!: Budget;
  public customers: Customer[] = [];
  public addresses: MultiSelectData[] = [];
  public products: Product[] = [];
  public productsSelected: Product[] = [];
  public productSelected!: Product | null;
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;
  public isDisabled: boolean = false;
  public form: FormGroup = this.fb.group({
    'createdById': ['', Validators.required ],
    'customerId': ['', Validators.required ],
    'addressesIds': [[]],
    'paymentMethod': ['', Validators.required ],
    'htmlDescription': ['']
  });
  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 5;
  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public isLoadingProducts: boolean = false;
  public dropdownSettingsMulti = {
    enableSearchFilter: true,
    singleSelection: false,
    text: 'Seleccionar sede(s)',
    selectAllText: 'Seleccionar todas',
    unSelectAllText: 'Quitar todas',
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
    filterSelectAllText: 'Seleccionar todos los resultados',
    filterUnSelectAllText: 'Quitar todos los resultados'
  };
  public paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta débito',
    'Tarjeta crédito',
    'Transferencia',
    'Cheque',
    'Por definir'
  ];
  public workTypes: WorkType[] = [];
  public editorConfig: AngularEditorConfig = {
    editable: true,
    height: '200px',
    sanitize: true
  };
  public htmlDescriptions: HtmlDescription[] = [];
  public htmlDescSelected!: string | null;
  public showNotAdreess: boolean = false;
  @ViewChild(InputSearchComponent) inputSearchComponent!: InputSearchComponent;
  public customerSearchQuery: string = '';
  public showCustomerDropdown: boolean = false;
  public filteredCustomers: Customer[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public authService: AuthService,
    private customersService: CustomersService,
    private productsService: ProductsService,
    private budgetsService: BudgetsService,
    public modalService: ModalService,
    private workTypesService: WorkTypesService,
    private htmlDescriptionsService: HtmlDescriptionsGeneralService,
    private location: Location
  ){}

  ngOnInit(): void {
    this.form.get('createdById')?.setValue(this.authService.user.id);
    combineLatest([
      this.customersService.getAllWithoutPagination(),
      this.workTypesService.getAll(),
      this.htmlDescriptionsService.getAll()
    ])
    .subscribe(combined => {
      this.customers = combined[0].customers;
      this.filteredCustomers = [...this.customers];
      if (this.budgetsService.customerIdSelected != 0) {
        this.selectCustomer(this.customers.find(c => c.id == this.budgetsService.customerIdSelected));
        this.isDisabled = true;
      }
      this.workTypes = combined[1].workTypes;
      this.htmlDescriptions = combined[2].htmlDescriptions;
    });
    if (this.budgetsService.customerIdSelected != 0) {
      this.form.get('customerId')?.setValue(this.budgetsService.customerIdSelected);
      this.changeModel('customerId');
      this.isDisabled = true;
    }
    if (!this.router.url.includes('edit')) { return; }
    this.isEdit = true;
    this.isLoading = true;
    this.activatedRoute.params
      .pipe(switchMap(({ id }) => this.budgetsService.getById(id)))
      .subscribe((resp: any) => {
        this.budget = resp.budget;
        this.selectCustomer(this.budget.customer);
        this.isDisabled = true;
        this.customersService.getAllAddressByCustomerIdWithoutPagination(this.budget.customerId)
          .subscribe({
            next: (resp) => {
              this.addresses = this.transformData(resp.addresses);
            }
          });
        const {
          createdById,
          customerId,
          paymentMethod,
          addresses,
          htmlDescription,
          budgetsProducts
        } = this.budget;
        this.form.setValue({
          createdById,
          customerId,
          paymentMethod,
          htmlDescription,
          addressesIds: this.transformData(addresses)
        });
        this.productsSelected = budgetsProducts.map(bp => {
          return {
            ...bp.product,
            amount: bp.amount,
            priceSale: String(bp.unitPrice),
            htmlDescription: bp.htmlDescription,
            showDescription: bp.showDescription
          };
        });
        this.isLoading = false;
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
    this.changeModel('customerId');
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.showCustomerDropdown = false;
    }
  }

  async handleSubmit() {
    this.formSubmitted = true;
    if (this.form.invalid) return;
    if (this.productsSelected.length == 0) return;
    if (this.form.get('addressesIds')?.value.length == 0) {
      this.showNotAdreess = true;
      return;
    }
    this.showNotAdreess = false;
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se ${this.isEdit ? 'actualizará la información de la cotización' : 'creará una nueva cotización'}`,
      confirmButtonText: `¡Si, ${this.isEdit ? 'actualizar' : 'crear'}!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });
    if (!isConfirmed) return;
    this.isSaving = true;
    const data = {
      ...this.form.value,
      addressesIds: (this.form.get('addressesIds')?.value as MultiSelectData[]).map(address => {
        return address.id;
      }),
      products: this.productsSelected.map(ps => {
        return {
          id: ps.id,
          amount: Number(ps.amount),
          priceSale: Number(ps.priceSale),
          showDescription: ps.showDescription,
          htmlDescription: ps?.htmlDescription
        };
      })
    };
    if (this.isEdit) {
      this.update(this.budget.id, data);
      return;
    }
    this.create(data);
  }

  async update(id: string, formData: any) {
    this.budgetsService.update(id, formData)
      .subscribe({
        next: async(resp) => {
          await Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
          this.router.navigateByUrl(`/customers/budgets/details/${resp.budget.id}`);
        },
        error: (error: any) => {
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

  async create(data: any) {
    this.budgetsService.create(data)
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
          this.router.navigateByUrl(`/customers/budgets/details/${resp.budget.id}`);
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

  inputInvalid(campo: string): boolean {
    if (this.form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  errorMessage(campo: string): string {
    return this.form.get(campo)?.hasError('required')
      ? `Este campo es requerido.`
      : this.form.get(campo)?.hasError('email')
      ? `Correo electrónico inválido.`
      : this.form.get(campo)?.hasError('minlength')
      ? `Mínimo ${this.form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.`
      : this.form.get(campo)?.hasError('maxlength')
      ? `Máximo ${this.form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.`
      : '';
  }

  changeModel(formName: string) {
    switch (formName) {
      case 'customerId':
        if (this.form.get('customerId')?.value == '') {
          this.addresses = [];
          return;
        }
        this.customersService.getAllAddressByCustomerIdWithoutPagination(this.form.get('customerId')?.value)
          .subscribe({
            next: (resp) => {
              this.addresses = this.transformData(resp.addresses);
            }
          });
        return;
      default:
        return;
    }
  }

  getProducts() {
    this.isLoadingProducts = true;
    this.productsService.getAllOnSale(this.currentPage, this.limit)
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

  changePage(currentPage: number) {
    this.currentPage = currentPage;
    if (!this.isSuggestions) {
      this.products = [];
      this.totalResults = 0;
    } else {
      this.searchProducts();
    }
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
  }

  removeProductToList(idx: number) {
    this.productsSelected.splice(idx, 1);
  }

  onItemSelect(item: any) {
  }

  OnItemDeSelect(item: any) {
  }

  onSelectAll(items: any) {
  }

  onDeSelectAll(items: any) {
  }

  private transformData(addresses: Address[]): MultiSelectData[] {
    return addresses.map(address => {
      return { id: address.id, itemName: `${address.name} | ${address.address}` };
    });
  }

  newHtmlDescription(htmlDescription: any) {
    this.productSelected!.htmlDescription = htmlDescription;
  }

  openHtmlDescriptionModal(productSelected: Product) {
    this.productSelected = productSelected;
    this.modalService.openModal();
  }

  onChangeHtmlDesc() {
    if (!this.htmlDescSelected) {
      this.form.get('htmlDescription')?.setValue('');
      return;
    }
    this.form.get('htmlDescription')?.setValue(this.htmlDescSelected);
  }

  getBaseGravable(): number {
    return this.productsSelected.reduce((sum, product) => {
      return sum + Number(product.amount!) * Number(product.priceSale!);
    }, 0);
  }

  getImpuesto(): number {
    return this.productsSelected.reduce((sum, product) => {
      return sum + Number(product.amount!) * Number(product.priceSale!) * 0.16;
    }, 0);
  }

  goToBack() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.budgetsService.customerIdSelected = 0;
  }
}