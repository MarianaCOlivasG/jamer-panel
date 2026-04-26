import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../interfaces';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-supplier-details',
  templateUrl: './supplier-details.component.html',
  styleUrls: ['./supplier-details.component.scss']
})
export class SupplierDetailsComponent {

  public supplier!: Supplier; 

  public isLoading: boolean = true;

  constructor( private activatedRoute: ActivatedRoute,
               private suppliersService: SuppliersService,
              private location: Location ,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}
               public edit:any;

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "suppliers")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.suppliersService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.supplier = resp.supplier;
        this.isLoading = false;
      });
  }


  goToBack( ) {
    this.location.back()
  }

}
