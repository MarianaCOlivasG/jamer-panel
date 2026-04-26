import { Component } from '@angular/core';
import { Bonus, Incidence } from '../../interfaces';
import { IncidencesService } from '../../services/incidences.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environment } from 'src/environments/environment.development';
import { BonusesService } from '../../services/bonuses.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss']
})
export class BonusesComponent {

  public bonuses: Incidence[] = [];
  public bonusSelected?: Incidence;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public modalSelected: 'details' | 'form' = 'details';

  public fileUrl: string = environment.apiUrl;

  public isDeleting: boolean = false;
  public deletingId: number = 0;

  constructor( private bonusesService: BonusesService,
               public authService: AuthService,
               public modalService: ModalService,
               private socketsRouteService: SocketsRouteService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ) {
  }
  public create: any;
  public edit:any;
  public deleted:any;
  ngOnInit(): void {

    this.getAll( this.currentPage, this.limit )

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "bonuses")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;

     
  }




  getAll( page: number, limit: number) {
    this.isLoading = true;
    this.bonusesService.getAll(page, limit)
      .subscribe({
        next: (resp: any) => {
          this.bonuses = resp.bonuses;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  searchBonuses( page: number, limit: number, queryString: string) {
    this.isLoading = true;
    this.bonusesService.search(page, limit, queryString)
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
      this.getAll( this.currentPage, this.limit )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchBonuses( this.currentPage, this.limit, this.querySearch )

  }


  changePage( currentPage: number ) {
      this.currentPage = currentPage;

      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit )
      } else {
        this.searchBonuses( this.currentPage, this.limit, this.querySearch )
      }
  }



  openModalEdit( bonus: Incidence ) {
    this.bonusSelected = bonus;
    this.modalSelected = 'form';
    this.modalService.openModal();
  }


  openModalCreate(){
    this.bonusSelected = undefined;
    this.modalSelected = 'form';
    this.modalService.openModal();
  }

  newBonus(){
    this.modalService.closeModal();
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getAll( this.currentPage, this.limit)
  }
  

  openModalDetails( bonus: Incidence ) {
    this.bonusSelected = bonus;
    this.modalSelected = 'details';
    this.modalService.openModal();
  }


  async deleteById( bonus: Bonus ) {

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se eliminará el bono`,
      confirmButtonText: `¡Si, eliminar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isDeleting = true;
    this.deletingId = bonus.id;

    this.bonusesService.deleteById( bonus.id )
      .subscribe({
        next: ( resp: any ) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isDeleting = false;
          this.deletingId = 0;

          this.changePage(this.currentPage);
        },
        error: ( error ) => {
          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isDeleting = false;
          this.deletingId = 0;
        }
      })
  }


}
