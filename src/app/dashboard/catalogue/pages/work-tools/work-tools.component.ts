import { Component } from '@angular/core';
import { WorkTool } from '../../interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import { WorkToolsService } from '../../services/work-tools.service';
import { combineLatest } from 'rxjs';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Router } from '@angular/router';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-work-tools',
  templateUrl: './work-tools.component.html',
  styleUrls: ['./work-tools.component.scss']
})
export class WorkToolsComponent {

  public workTools: WorkTool[] = [];

  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor(  public authService: AuthService,
                private workToolsService: WorkToolsService ,
                private localStorageService: LocalStorageService,
                private router: Router,
                ){}
                public create: any;
                public edit:any;
                public deleted:any;
  ngOnInit(): void {
      this.getWorkTools();

      const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

      const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
      ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
       this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
       this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
       this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
  }

  
  getWorkTools() {
    this.isLoading = true;
    this.workToolsService.getAll(
      this.currentPage, 
      this.limit, 
    )
      .subscribe({
        next: (resp: any) => {
          this.workTools = resp.workTools;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchWorkTools() {
    this.isLoading = true;
    this.workToolsService.search(
      this.currentPage, 
      this.limit, 
      this.querySearch
    )
      .subscribe({
        next: (resp: any) => {
          this.workTools = resp.workTools;
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
      this.getWorkTools();
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchWorkTools()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getWorkTools();
      } else {
        this.searchWorkTools();
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    this.getWorkTools();
  }

  disableOrEnable( product: any ) {

  }

}
