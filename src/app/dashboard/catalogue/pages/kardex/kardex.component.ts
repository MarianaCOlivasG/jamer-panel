import { Component, OnInit } from '@angular/core';
import { MultiSelectData } from 'src/app/shared/interfaces/multi-select-data.interface';
import { ProductsService } from '../../services/products.service';
import { Kardex, Product } from '../../interfaces';
import { KardexService } from '../../services/kardex.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Router } from '@angular/router';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.scss']
})
export class KardexComponent implements OnInit{ 
 
  public kardex: Kardex[] = [];

  public products: MultiSelectData[] = []

  public product!: MultiSelectData[];
  public productDetails!: Product;

  public dropdownSettings = { 
    enableSearchFilter: true,
    singleSelection: true, 
    text:"Selecciona un producto",
    noDataLabel: 'Sin resultados',
    searchPlaceholderText: 'Buscar',
  };

  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor( private productsService: ProductsService,
               private kardexService: KardexService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) {

  }


  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "kardex")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    this.productsService.getAllWithoutPagination()
      .subscribe({
        next: (resp) => {
          console.log(resp);
          this.products = this.transformData(resp.products);
          this.getKardex();
        }
      })
  }


  private transformData( products: Product[] ): MultiSelectData[] {
    return products.map( product => {
      return {
        id: product.id,
        itemName: product.name
      }
    })
  }

  getKardex() {
    this.isLoading = true;
    this.kardexService.getAll(
      this.currentPage, 
      this.limit, 
      this.product?.length > 0 ? Number(this.product[0].id) : 0
    )
      .subscribe({
        next: (resp: any) => {
          console.log(resp);
          this.kardex = resp.kardex.filter((item: Kardex) => parseInt(item.amont.toString()) !== 0); 
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  searchKardex() {
    this.isLoading = true;
    this.kardexService.search(
      this.currentPage, 
      this.limit,
      this.querySearch,
      0
    )
      .subscribe({
        next: (resp: any) => {
          this.kardex = resp.kardex;
          this.kardex = resp.kardex.filter((item: Kardex) => parseInt(item.amont.toString()) !== 0); 

          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  search(query:string):void {
    this.currentPage = 1;

    if (query.length == 0) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.getKardex();
      return;
    }

    if (query.trim().length == 0) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchKardex();
  }

  changePage(currentPage: number) {
    this.currentPage = currentPage;
    if (!this.isSuggestions) {
      this.getKardex();
    } else {
      this.searchKardex();
    }
  }

  onItemSelect(item: MultiSelectData) {
    this.productsService.getById(Number(item.id)) 
      .subscribe({
        next: (resp) => {
          this.productDetails = resp['product'];
          if (!this.isSuggestions) {
            this.getKardex();
          } else {
            this.searchKardex();
          }
        }
      });
  }

  OnItemDeSelect(item:any) {
    console.log(item);
    this.productDetails = undefined!;
  }

  onSelectAll(items: any) {
    console.log(items);
  }

  onDeSelectAll(items: any) {
    this.productDetails = undefined!;
    if (!this.isSuggestions) {
      this.getKardex();
    } else {
      this.searchKardex();
    }
  }

  // Nuevas funciones para el diseño mejorado

  // Calcula la cantidad total de productos (considera positivos y negativos)
  getTotalAmount(): string {
    if (!this.kardex || this.kardex.length === 0) return '0';
    
    const inAmount = this.kardex
      .filter(item => item.concept === 'in')
      .reduce((sum, item) => sum + parseInt(item.amont.toString()), 0);
      
    const outAmount = this.kardex
      .filter(item => item.concept === 'out')
      .reduce((sum, item) => sum + parseInt(item.amont.toString()), 0);
      
    return `${inAmount - outAmount}`;
  }

  // Calcula el valor total de los movimientos
  getTotalValue(): number {
    if (!this.kardex || this.kardex.length === 0) return 0;
    
    const inValue = this.kardex
      .filter(item => item.concept === 'in')
      .reduce((sum, item) => sum + (item.cost * item.amont), 0);
      
    const outValue = this.kardex
      .filter(item => item.concept === 'out')
      .reduce((sum, item) => sum + (item.cost * item.amont), 0);
      
    return inValue - outValue;
  }

  // Exportar a Excel (funcionalidad a implementar)
  exportToExcel() {
    // Implementación pendiente
    console.log('Exportar a Excel');
    alert('Funcionalidad de exportación en desarrollo');
  }

  // Imprimir informe
  printReport() {
    window.print();
  }
}