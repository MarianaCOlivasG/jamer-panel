import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../interfaces';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'store-products',
  templateUrl: './store-products.component.html',
  styleUrls: ['./store-products.component.scss']
})
export class StoreProductsComponent implements OnInit {
  @Input() storeId!: number;
  
  public products: Product[] = [];
  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 20;
  public businessLineId: number = 0;
  public businessFamilyId: number = 0;
  public productTypeId: number = 0;
  public isLoading: boolean = false;
  
  constructor(private productsService: ProductsService) {}
  
  ngOnInit(): void {
    this.getProducts();
  }
  
  getProducts(): void {
    this.isLoading = true;
    this.productsService.getAllByStoreId(
      this.storeId,
      this.currentPage, 
      this.limit, 
      this.businessLineId, 
      this.businessFamilyId,
      this.productTypeId,
    )
    .subscribe({
      next: (resp: any) => {
        console.log(resp)
        this.products = resp.products;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    })
  }
}