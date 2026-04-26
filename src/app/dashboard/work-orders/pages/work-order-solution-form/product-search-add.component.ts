import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from 'src/app/dashboard/catalogue/interfaces';
import { ProductsService } from 'src/app/dashboard/catalogue/services/products.service';

@Component({
  selector: 'app-product-search-add',
  templateUrl: './product-search-add.component.html',
  styleUrls: ['./product-search-add.component.scss']
})
export class ProductSearchAddComponent implements OnInit {

  @Output() onProductAdd = new EventEmitter<Product>();
  // En caso de necesitar resetear o recibir datos desde el padre
  @Input() placeholder: string = 'Buscar producto...';

  public products: any[] = [];
  public querySearch: string = '';
  public isLoadingProducts: boolean = false;
  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 5;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {}

  searchProducts(): void {
    if (this.querySearch.trim().length === 0) {
      this.products = [];
      this.totalResults = 0;
      return;
    }
    this.isLoadingProducts = true;
    this.productsService.searchOnSale(
      this.currentPage, 
      this.limit, 
      this.querySearch.trim()
    ).subscribe({
      next: (resp: any) => {
        // Se asignan los productos y se reinician las cantidades para que la búsqueda sea independiente
        this.products = resp.products.map((product: Product) => ({
          ...product,
          amount: 0,
          showDescription: false
        }));
        console.log(this.products);
        this.products = this.products.filter((product: Product) => product.productTypeId        == 1);
        this.totalResults = resp.totalResults;
        this.isLoadingProducts = false;
      },
      error: () => {
        this.isLoadingProducts = false;
      }
    });
  }

  onInputChange(query: string): void {
    this.querySearch = query;
    this.currentPage = 1;
    this.searchProducts();
  }

  addProductToList(idx: number): void {
    let product = this.products[idx];
    if (!product.amount || product.amount <= 0) {
      return;
    }
    product.businessFamily= product.businessFamily.name
    product.businessLine= product.businessLine.name
    this.onProductAdd.emit({ ...product });
    this.products = [];
    this.querySearch = '';
    this.totalResults = 0;
  }

  resetInput(): void {
    this.querySearch = '';
  }
}