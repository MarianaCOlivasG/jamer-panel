import { Component, Output } from '@angular/core';
import { Maintenance } from '../../../interfaces/maintenance.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ActivatedRoute } from '@angular/router';
import { MaintenanceService } from '../../../services/maintenance.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent {


  public maintenance: Maintenance[] = [];
  public maintenanceSelected?: Maintenance | null;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public workToolId!: number;

  constructor( public modalService: ModalService,
               private maintenanceService: MaintenanceService,
               private activatedRoute: ActivatedRoute ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.workToolId = +id;
      this.getAllByWorkToolId( this.currentPage, this.limit, this.workToolId );
    });
  }

  getAllByWorkToolId( page: number, limit: number, workToolId: number ) {
    this.isLoading = true;
    this.maintenanceService.getAll(page, limit, workToolId)
      .subscribe({
        next: (resp: any) => {
          this.maintenance = resp.maintenance;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }
            
  searchMaintenance( page: number, limit: number, workToolId: number, queryString: string) {
    this.isLoading = true;
    this.maintenanceService.search(page, limit, queryString, workToolId )
      .subscribe({
        next: (resp: any) => {
          this.maintenance = resp.maintenance;
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
      this.getAllByWorkToolId( this.currentPage, this.limit, this.workToolId )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };
            
    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchMaintenance( this.currentPage, this.limit, this.workToolId, this.querySearch )

  }
            
            
  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAllByWorkToolId( this.currentPage, this.limit, this.workToolId )
      } else {
        this.searchMaintenance( this.currentPage, this.limit, this.workToolId, this.querySearch )
      }
  }


  openModalCreate() {
    this.maintenanceSelected = null;
    this.modalService.openModal();
  }


  newMaintenance() {
    this.modalService.closeModal();
    this.getAllByWorkToolId( this.currentPage, this.limit, this.workToolId );
  }

  openModalUpdate( maintenance: Maintenance ) {
    this.maintenanceSelected = maintenance;
    this.modalService.openModal();
  }



  async handleDelete( id: number, idx: number ) {

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se eliminará mantenimiento`,
      confirmButtonText: `¡Si, eliminar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;


    this.maintenanceService.remove( id )
      .subscribe({
        next: ( resp: any ) => {
          this.maintenance.splice(idx, 1);
          // this.totalResults = this.workStations.length;

          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

        },
        error: ( error ) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })
  }


  async handleEntry( id: number ) {

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se marcará como entrada de herramienta.`,
      confirmButtonText: `¡Si, aceptar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.maintenanceService.setEntry( id )
      .subscribe({
        next: ( resp: any ) => {

          this.getAllByWorkToolId( this.currentPage, this.limit, this.workToolId );

          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

        },
        error: ( error ) => {
          Swal.fire({
            text: error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
        }
      })


  }

}
