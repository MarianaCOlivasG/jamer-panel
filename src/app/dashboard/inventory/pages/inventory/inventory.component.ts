import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { BusinessFamily, BusinessLine, Product, ProductType } from '../../../catalogue/interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ProductsService } from '../../../catalogue/services/products.service';
import { BusinessLinesService } from '../../../catalogue/services/business-lines.service';
import { BusinessFamiliesService } from '../../../catalogue/services/business-families.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StoresService } from '../../../catalogue/services/stores.service';
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {

  public totalInStock: any = {};

  constructor(  public authService: AuthService,
                private productsService: ProductsService,
                private localStorageService: LocalStorageService,
                private router: Router,
                ){}

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    combineLatest([   
      this.productsService.countInStock(),
    ])
    .subscribe( combined => {
      this.totalInStock = combined[0].totalInStock;
    });

  }

 
}
