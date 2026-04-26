import { Component } from '@angular/core';
import { BusinessLine } from '../../interfaces';
import { BusinessLinesService } from '../../services/business-lines.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Router } from '@angular/router';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-business-lines',
  templateUrl: './business-lines.component.html',
  styleUrls: ['./business-lines.component.scss']
})
export class BusinessLinesComponent {

  public businessLines: BusinessLine[] = [];
  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  constructor( private businessLinesService: BusinessLinesService,
    private localStorageService: LocalStorageService,
    private router: Router,
    ) { }
    public create: any;
    public edit:any;
    public deleted:any;
  ngOnInit(): void {
    this.getAll( this.currentPage, this.limit );

    
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "business line")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
  }


  getAll( page: number, limit: number ) {
    this.isLoading = true;
    this.businessLinesService.getAll(page, limit)
      .subscribe({
        next: (resp: any) => {
          this.businessLines = resp.businessLines;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchBusinessLines( page: number, limit: number, queryString: string) {
    this.isLoading = true;
    this.businessLinesService.search(page, limit, queryString)
      .subscribe({
        next: (resp: any) => {
          this.businessLines = resp.businessLines;
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
      this.getAll( this.currentPage, this.limit )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchBusinessLines( this.currentPage, this.limit, this.querySearch )

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit)
      } else {
        this.searchBusinessLines( this.currentPage, this.limit, this.querySearch )
      }
  }

}
