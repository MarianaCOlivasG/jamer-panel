import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { Product, ProductType, BusinessLine, BusinessFamily } from '../../../interfaces';
import { BusinessFamiliesService } from '../../../services/business-families.service';
import { BusinessLinesService } from '../../../services/business-lines.service';
import { ProductsService } from '../../../services/products.service';

@Component({
  selector: 'products-general-list',
  templateUrl: './products-general-list.component.html',
  styleUrls: ['./products-general-list.component.scss']
})
export class ProductsGeneralListComponent implements OnInit {

  public products: Product[] = [];
  public isLoading: boolean = false;
  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 20;
  
  public showOutOfStock: boolean = false;
  public querySearch: string = '';
  public businessLineId: number = 0;
  public businessFamilyId: number = 0;
  public productTypeId: number = 0;

  public productTypes: ProductType[] = [];
  public businessLines: BusinessLine[] = [];
  public businessFamilies: BusinessFamily[] = [];

  constructor(
    private productsService: ProductsService,
    private businessLinesService: BusinessLinesService,
    private businessFamiliesService: BusinessFamiliesService
  ) {}

  ngOnInit(): void {
    // Cargar opciones de filtros de forma concurrente
    combineLatest([
      this.productsService.getTypes(),
      this.businessLinesService.getAllWithoutPagination(),
      this.businessFamiliesService.getAllWithoutPagination(this.businessLineId)
    ]).subscribe((combined: any) => {
      this.productTypes = combined[0].productTypes;
      this.businessLines = combined[1].businessLines;
      this.businessFamilies = combined[2].businessFamilies;
    });

    this.getProducts();
  }

  getProducts(): void {
    this.isLoading = true;
    this.productsService.getAll(
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      0,  // parámetro extra (por ejemplo, estado)
      this.productTypeId,
      1   // indicador para productos activos
    ).subscribe({
      next: (resp: any) => {
        this.products = resp.products;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  searchProducts(): void {
    this.isLoading = true;
    this.productsService.search(
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      0, // parámetro extra
      this.productTypeId,
      1, // indicador para productos activos
      this.querySearch
    ).subscribe({
      next: (resp: any) => {
        this.products = resp.products;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  search(query: string): void {
    this.currentPage = 1;
    if (query.trim().length === 0) {
      this.querySearch = '';
      this.getProducts();
      return;
    }
    this.querySearch = query.trim();
    this.searchProducts();
  }

  changeModel(formName: string): void {
    this.currentPage = 1;
    if (formName === 'businessLineId') {
      if (this.businessLineId === 0) {
        this.businessFamilies = [];
        this.getProducts();
        return;
      }
      this.businessFamiliesService.getAllWithoutPagination(this.businessLineId)
        .subscribe((resp: any) => {
          this.businessFamilies = resp.businessFamilies;
          this.getProducts();
        });
    } else {
      this.getProducts();
    }
  }

  changePage(currentPage: number): void {
    this.currentPage = currentPage;
    if (this.querySearch && this.querySearch.trim().length > 0) {
      this.searchProducts();
    } else {
      this.getProducts();
    }
  }

  // Retorna los productos ordenados: primero los que tienen stock, seguidos de los agotados.
  // Si showOutOfStock es false, sólo se muestran los productos con existencias.
  get sortedProducts(): Product[] {
    const activeProducts = this.products.filter(p => p.availableStock > 0);
    const outOfStockProducts = this.products.filter(p => p.availableStock === 0);
    let result = activeProducts.concat(outOfStockProducts);
    if (!this.showOutOfStock) {
      result = activeProducts;
    }
    return result;
  }
}