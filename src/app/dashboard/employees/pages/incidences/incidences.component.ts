import { Component } from '@angular/core';
import { Incidence } from '../../interfaces';
import { IncidencesService } from '../../services/incidences.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environment } from 'src/environments/environment.development';
import Swal from 'sweetalert2';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incidences',
  templateUrl: './incidences.component.html',
  styleUrls: ['./incidences.component.scss']
})
export class IncidencesComponent {

  public incidences: Incidence[] = [];
  public incidenceSelected?: Incidence;
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

  constructor( private incidencesService: IncidencesService,
               public authService: AuthService,
               public modalService: ModalService,
               private localStorageService: LocalStorageService,
               private router: Router,

               ) {
  }
  public createIncidence: any;
  public editIncidence:any;
  public deleteIncidence:any;
  ngOnInit(): void {
    // Eventos del socket
    // this.onMarkAsReadEventSocket();
    // this.onMarkAsConfirmEventSocket();

    this.getAll( this.currentPage, this.limit )
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const incidence = (storedPermissions?.find((p)=> p.page == "incidences")?.permissions );
    ((incidence as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.createIncidence =  ((incidence as number >> 1 ) % 2 == 1)? true :false; 
     this.editIncidence =  ((incidence as number >> 2 ) % 2 == 1)? true :false; 
     this.deleteIncidence =  ((incidence as number >> 3 ) % 2 == 1)? true :false; 
  }

  // onMarkAsReadEventSocket() {
  //   this.socketService.socket.on('mark-as-read-incidence', (payload: {incidenceId: string}) => {
  //     this.incidences.map( incidence => {
  //       if ( incidence.id == +payload.incidenceId ) {
  //         incidence.isRead = true;
  //       }
  //       return incidence;
  //     });
  //   })
  // }

  // onMarkAsConfirmEventSocket() {
  //   this.socketService.socket.on('mark-as-confirm-incidence', (payload: {incidenceId: string}) => {
      
  //     this.incidences.map( incidence => {
  //       if ( incidence.id == +payload.incidenceId ) {
  //         incidence.isValidated = true;
  //       }
  //       return incidence;
  //     });
  //   })
  // }


  getAll( page: number, limit: number) {
    this.isLoading = true;
    this.incidencesService.getAll(page, limit)
      .subscribe({
        next: (resp: any) => {
          this.incidences = resp.incidences;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  

  searchIncidences( page: number, limit: number, queryString: string) {
    this.isLoading = true;
    this.incidencesService.search(page, limit, queryString)
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
      this.getAll( this.currentPage, this.limit )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchIncidences( this.currentPage, this.limit, this.querySearch )

  }


  changePage( currentPage: number ) {
      this.currentPage = currentPage;

      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit )
      } else {
        this.searchIncidences( this.currentPage, this.limit, this.querySearch )
      }
  }



  openModalEdit( incidence: Incidence ) {
    this.incidenceSelected = incidence;
    this.modalSelected = 'form';
    this.modalService.openModal();
  }


  openModalCreate(){
    this.incidenceSelected = undefined;
    this.modalSelected = 'form';
    this.modalService.openModal();
  }

  newIncidence(){
    this.modalService.closeModal();
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getAll( this.currentPage, this.limit)
  }
  

  openModalDetails( incidence: Incidence ) {
    this.incidenceSelected = incidence;
    this.modalSelected = 'details';
    this.modalService.openModal();
  }


  async deleteById( incidence: Incidence ) {

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se eliminará la incidencia`,
      confirmButtonText: `¡Si, eliminar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isDeleting = true;
    this.deletingId = incidence.id;

    this.incidencesService.deleteById( incidence.id )
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
