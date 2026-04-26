import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BusinessFamiliesService } from '../../services/business-families.service';
import { BusinessFamily } from '../../interfaces';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'business-families',
  templateUrl: './business-families.component.html',
})
export class BusinessFamiliesComponent implements OnInit {

  public businessFamilies: BusinessFamily[] = [];
  public businessFamily!: BusinessFamily | null;
  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public businessLineId: number = 0;

  constructor( public authService: AuthService,
               private activatedRoute: ActivatedRoute,
               private businessFamiliesService: BusinessFamiliesService,
               public modalService: ModalService,
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

    this.activatedRoute.params.subscribe( ({id}) => {
      this.businessLineId = id;
      this.getAll( this.currentPage, this.limit, this.businessLineId);
    })
  }


  getAll( page: number, limit: number, businessLineId: number ) {
    this.isLoading = true;
    this.businessFamiliesService.getAll(page, limit, businessLineId)
      .subscribe({
        next: (resp: any) => {
          this.businessFamilies = resp.businessFamilies;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchBusinessFamilies( page: number, limit: number, businessLineId: number, queryString: string) {
    this.isLoading = true;
    this.businessFamiliesService.search(page, limit, businessLineId, queryString)
      .subscribe({
        next: (resp: any) => {
          this.businessFamilies = resp.businessFamilies;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  search( query:string ):void {

    this.currentPage = 1;

    if ( query.length == 0 ) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.getAll( this.currentPage, this.limit, this.businessLineId )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchBusinessFamilies( this.currentPage, this.limit, this.businessLineId, this.querySearch )

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit, this.businessLineId)
      } else {
        this.searchBusinessFamilies( this.currentPage, this.limit, this.businessLineId, this.querySearch )
      }
  }



  disableOrEnable( businessFamily: BusinessFamily ) {

  }


  edit( businessFamily: BusinessFamily ) {
    this.businessFamily = businessFamily;
    this.modalService.openModal();
  }

  openModal() {
    this.businessFamily = null;
    this.modalService.openModal();
  }

  newFamily() {
    this.modalService.closeModal();
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getAll( this.currentPage, this.limit, this.businessLineId)
  }


}
