import { Component } from '@angular/core';
import { Store } from '../../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { StoresService } from '../../../services/stores.service';
import { switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.scss']
})
export class StoreDetailsComponent {

  public store!: Store; 

  public isLoading: boolean = true;

  constructor( private activatedRoute: ActivatedRoute,
               private storesService: StoresService,
               private authService: AuthService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}
public edit:any;
  ngOnInit(): void {

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.storesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.store = resp.store;
        this.isLoading = false;
      });

      const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

      const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
      ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
       this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 

  }

  onRemoveSuccess( workToolStoreId: number ) {
   
  }

}
