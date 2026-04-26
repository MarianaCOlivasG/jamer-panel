import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { switchMap } from 'rxjs';
import { BusinessFamily } from '../../../interfaces';
import { BusinessFamiliesService } from '../../../services/business-families.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-business-family-details',
  templateUrl: './business-family-details.component.html',
})
export class BusinessFamilyDetailsComponent {

  public businessFamily!: BusinessFamily; 

  public isLoading: boolean = true;

  constructor( private activatedRoute: ActivatedRoute,
               private location: Location,
               private businessFamiliesService: BusinessFamiliesService,
               private modalService: ModalService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}
               public create: any;
               public edited:any;
               public deleted:any;
  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "business line")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edited =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.businessFamiliesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.businessFamily = resp.businessFamily;
        this.isLoading = false;
      });
  }


  openModal(){
    this.modalService.openModal();
  }


  goToBack(): void {
    this.location.back();
  }

}
