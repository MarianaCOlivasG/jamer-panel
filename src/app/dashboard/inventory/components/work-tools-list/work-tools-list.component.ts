import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { WorkTool } from 'src/app/dashboard/catalogue/interfaces';
import { WorkToolsService } from 'src/app/dashboard/catalogue/services/work-tools.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'work-tools-list',
  templateUrl: './work-tools-list.component.html',
  styleUrls: ['./work-tools-list.component.scss']
})
export class WorkToolsListComponent {

  public workTools: WorkTool[] = [];

  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public isSaving: boolean = false;

  constructor(  public authService: AuthService,
                private workToolsService: WorkToolsService ){}

  ngOnInit(): void {
      this.getWorkTools();
  }

  
  getWorkTools() {
    this.isLoading = true;
    this.workToolsService.getAllInStok(
      this.currentPage, 
      this.limit
    )
      .subscribe({
        next: (resp: any) => {
          this.workTools = resp.workTools;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchProducts() {
    this.isLoading = true;
    this.workToolsService.searchInStock(
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
    this.searchProducts()

  }



  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getWorkTools();
      } else {
        this.searchProducts();
      }
  }


  disableOrEnable( product: any ) {
  }


  onAddSuccess() {
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getWorkTools()
  }



}
