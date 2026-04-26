import { Component } from '@angular/core';
import { BusinessLine } from '../../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessLinesService } from '../../../services/business-lines.service';
import { switchMap } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-business-line-details',
  templateUrl: './business-line-details.component.html',
})
export class BusinessLineDetailsComponent {


  public businessLine!: BusinessLine; 

  public isLoading: boolean = true;

  constructor( private activatedRoute: ActivatedRoute,
               private businessLinesService: BusinessLinesService,
               private modalService: ModalService,
              private location: Location,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}
               public create: any;
               public edit:any;
               public deleted:any;
  ngOnInit(): void {

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "business line")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.businessLinesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.businessLine = resp.businessLine;
        this.isLoading = false;
      });
  }


  openModal(){
    this.modalService.openModal();
  }

  goToBack() {
    this.location.back()
  }

}
