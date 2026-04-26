import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Bonus } from 'src/app/dashboard/employees/interfaces';
import { BonusesService } from 'src/app/dashboard/employees/services/bonuses.service';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'user-bonuses',
  templateUrl: './user-bonuses.component.html',
  styleUrls: ['./user-bonuses.component.scss']
})
export class UserBonusesComponent {

  @Output() totalResultsEvent = new EventEmitter<number>();

  public bonuses: Bonus[] = [];
  public bonusSelected!: Bonus;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor( private bonusesService: BonusesService,
               public authService: AuthService,
               public modalService: ModalService,
             ) {
  }

  ngOnInit(): void {
    
    this.getAll( this.currentPage, this.limit, this.authService.user.id)
  }



  getAll( page: number, limit: number, employeeId: number) {
    this.isLoading = true;
    this.bonusesService.getAll(page, limit, employeeId)
      .subscribe({
        next: (resp: any) => {
          this.bonuses = resp.bonuses;
          this.totalResults = resp.totalResults;
          this.totalResultsEvent.emit(this.totalResults);
          this.isLoading = false;
        },
    })
  }

  searchBonuses( page: number, limit: number, queryString: string, employeeId: number) {
    this.isLoading = true;
    this.bonusesService.search(page, limit, queryString, employeeId)
      .subscribe({
        next: (resp: any) => {
          this.bonuses = resp.bonuses;
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
    this.searchBonuses( this.currentPage, this.limit, this.querySearch, this.authService.user.id )

  }


  changePage( currentPage: number ) {
      this.currentPage = currentPage;

      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit, this.authService.user.id)
      } else {
        this.searchBonuses( this.currentPage, this.limit, this.querySearch, this.authService.user.id )
      }
  }


  openModal( bonus: Bonus ){
    this.modalService.setName('bonuses');
    this.modalService.openModal();
    this.bonusSelected = bonus;
  }


  newBonusConfirm(){
    this.modalService.closeModal();
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getAll( this.currentPage, this.limit, this.authService.user.id)
  }


  markAsRead( id: any ) {
    this.bonuses = this.bonuses.map( bonus => {
       if ( bonus.id == id ) {
        bonus.isRead = true;
       }
       return bonus;
    })
  }

}
