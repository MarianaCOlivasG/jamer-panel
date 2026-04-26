import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Incidence } from 'src/app/dashboard/employees/interfaces';
import { IncidencesService } from 'src/app/dashboard/employees/services/incidences.service';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'user-incidences',
  templateUrl: './user-incidences.component.html',
  styleUrls: ['./user-incidences.component.scss']
})
export class UserIncidencesComponent implements OnInit {

  @Output() totalResultsEvent = new EventEmitter<number>();

  public incidences: Incidence[] = [];
  public incidenceSelected!: Incidence;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor( private incidencesService: IncidencesService,
               public authService: AuthService,
               public modalService: ModalService, ) {
  }

  ngOnInit(): void {
    
    this.getAll( this.currentPage, this.limit, this.authService.user.id)
  }



  getAll( page: number, limit: number, employeeId: number) {
    this.isLoading = true;
    this.incidencesService.getAll(page, limit, employeeId)
      .subscribe({
        next: (resp: any) => {
          this.incidences = resp.incidences;
          this.totalResults = resp.totalResults;
          this.totalResultsEvent.emit(this.totalResults)
          this.isLoading = false;
        },
    })
  }

  searchIncidences( page: number, limit: number, queryString: string, employeeId: number) {
    this.isLoading = true;
    this.incidencesService.search(page, limit, queryString, employeeId)
      .subscribe({
        next: (resp: any) => {
          this.incidences = resp.incidences;
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
      this.getAll( this.currentPage, this.limit, this.authService.user.id)
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchIncidences( this.currentPage, this.limit, this.querySearch, this.authService.user.id )

  }


  changePage( currentPage: number ) {
      this.currentPage = currentPage;

      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit, this.authService.user.id)
      } else {
        this.searchIncidences( this.currentPage, this.limit, this.querySearch, this.authService.user.id )
      }
  }


  openModal( incidence: Incidence ){
    this.modalService.setName('incidences');
    this.modalService.openModal();
    this.incidenceSelected = incidence;
  }


  newIncidenceConfirm(){
    this.modalService.closeModal();
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getAll( this.currentPage, this.limit, this.authService.user.id)
  }


  markAsRead( id: any ) {
    this.incidences = this.incidences.map( incidence => {
       if ( incidence.id == id ) {
        incidence.isRead = true;
       }
       return incidence;
    })
  }

}
