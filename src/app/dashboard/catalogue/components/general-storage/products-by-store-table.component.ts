import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Store } from '../../interfaces';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';

interface AggregatedProduct {
  id: number;
  name: string;
  quantities: { [storeId: number]: number };
  unit: string;
}

@Component({
  selector: 'products-by-store-table',
  templateUrl: './products-by-store-table.component.html',
  styleUrls: ['./products-by-store-table.component.scss']
})
export class ProductsByStoreTableComponent implements OnInit {
  public stores: Store[] = [];
  public aggregatedProducts: AggregatedProduct[] = [];
  public isLoading: boolean = false;
  
  // Propiedades para filtrado (AÑADIDAS)
  searchTerm: string = '';
  stockFilter: string = 'all';
  storeVisibility: string = 'all';
  filteredProducts: any[] = [];
  allStores: any[] = [];
  visibleStores: any[] = []; 

  constructor(
    private storesService: StoresService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.storesService.getAll(1, 1000, 0).subscribe({
      next: (storeResp: any) => {
        this.stores = storeResp.stores;
        
        // Inicializar allStores con propiedad visible (AÑADIDO)
        this.allStores = this.stores.map(store => ({
          ...store,
          visible: true
        }));
        
        const productObservables = this.stores.map(store => {
          if (store.id === 1) {
            return this.productsService.getAll(1, 100, 0, 0, 0, 0, 1);
          } else {
            return this.productsService.getAllByStoreId(
              store.id,
              1,
              100,
              0,
              0,
              0
            );
          }
        });
        
        forkJoin(productObservables).subscribe({
          next: (results: any[]) => {
            const productMap: { [productId: number]: AggregatedProduct } = {};
            
            this.stores.forEach((store, index) => {
              const products = results[index].products;
              products.forEach((prod: any) => {
                if (!productMap[prod.id]) {
                  productMap[prod.id] = {
                    id: prod.id,
                    name: prod.name,
                    quantities: {},
                    unit: prod.unit
                  };
                }
                const amount =
                  store.id === 1
                    ? (prod.availableStock || 0)
                    : (prod.productStores && prod.productStores.length > 0 ? prod.productStores[0].amount : 0);
                productMap[prod.id].quantities[store.id] = amount;
              });
            });
            
            this.aggregatedProducts = Object.values(productMap);
            this.aggregatedProducts.forEach(product => {
              this.stores.forEach(store => {
                if (product.quantities[store.id] === undefined) {
                  product.quantities[store.id] = 0;
                }
              });
            });
            
            // Aplicar filtros después de cargar datos (AÑADIDO)
            this.applyFilters();
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getTotal(product: AggregatedProduct): number {
    let total = 0;
    this.stores.forEach(store => {
      total += product.quantities[store.id] || 0;
    });
    return total;
  }

  // ================== MÉTODOS AÑADIDOS ================== //
  
  applyFilters() {
    // Actualizar visibleStores basado en las selecciones
    this.visibleStores = this.allStores.filter(store => store.visible);
    
    // Filtrar productos por término de búsqueda y existencias
    this.filteredProducts = this.aggregatedProducts.filter(product => {
      // Filtro de búsqueda
      const nameMatch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro de existencias
      let stockMatch = true;
      const total = this.getTotal(product);
      
      if (this.stockFilter === 'inStock') {
        stockMatch = total > 0;
      } else if (this.stockFilter === 'lowStock') {
        stockMatch = total > 0 && total < 5;
      }
      
      return nameMatch && stockMatch;
    });
  }

  toggleAllStores() {
    if (this.storeVisibility === 'all') {
      this.allStores.forEach(store => store.visible = true);
    } else if (this.storeVisibility === 'active') {
      this.allStores.forEach(store => store.visible = store.isActive);
    }
    
    this.applyFilters();
  }

  formatUnit(unit: string, quantity: number): string {
    return 'Uds'
    if (unit === '1') {
      return quantity !== 1 ? 'pzas' : 'pza';
    } else {
      return quantity !== 1 ? unit + 's' : unit;
    }
  }

  resetFilters() {
    this.searchTerm = '';
    this.stockFilter = 'all';
    this.storeVisibility = 'all';
    this.allStores.forEach(store => store.visible = true);
    this.applyFilters();
  }

  printReport() {
    window.print();
  }

  exportToExcel() {
    alert('Funcionalidad de exportación en desarrollo');
    // Implementar la exportación a Excel
  }
}