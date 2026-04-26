import { Component } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Product } from '../../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment.development';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {

  
  public product!: Product; 
  public productSelected!: Product;

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;

  public modalSelected: 'image' | 'files' | null = 'files';



  constructor( private activatedRoute: ActivatedRoute,
               private productsService: ProductsService,
               public modalService: ModalService,
               public authService: AuthService,
              private location: Location,

               private localStorageService: LocalStorageService,
               ){}
public edit:any;
  ngOnInit(): void {
    this.getProduct();
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
  }

  getProduct() {
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.productsService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.product = resp.product;
        this.isLoading = false;
      });
  }


  openModal( product: Product, modalSelected: 'image' | 'files'  ) {
    if ( this.authService.user.role.key != 'admin' ) return;
    this.productSelected = product;
    this.modalSelected = modalSelected;
    this.modalService.openModal();
  }


  changeImage( newPicture: string) {
    this.product.image = newPicture;
  }


  closeModalEvent() {
    this.modalSelected = null;
    this.modalService.closeModal();
  }


  goToBack() {
    this.location.back()
  }

}
 