import { Component, Output } from '@angular/core';
import { Maintenance } from '../../../interfaces/maintenance.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MaintenanceVehicleService } from '../../../services/maintenance-vehicle.service';

@Component({
  selector: 'maintenance-vehicle',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceVehicleComponent {


  public maintenance: Maintenance[] = [];
  public maintenanceSelected?: Maintenance | null;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';
  public vehicleId!: number;

  constructor( public modalService: ModalService,
               private maintenanceService: MaintenanceVehicleService,
               private activatedRoute: ActivatedRoute ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({id}) => {
      this.vehicleId = +id;
      this.getAllByVehicleId( this.currentPage, this.limit, this.vehicleId );
    });
  }

  getAllByVehicleId( page: number, limit: number, vehicleId: number ) {
    this.isLoading = true;
    this.maintenanceService.getAll(page, limit, vehicleId)
      .subscribe({
        next: (resp: any) => {
          this.maintenance = resp.maintenance;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }
            
  searchMaintenance( page: number, limit: number, vehicleId: number, queryString: string) {
    this.isLoading = true;
    this.maintenanceService.search(page, limit, queryString, vehicleId )
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
      this.getAllByVehicleId( this.currentPage, this.limit, this.vehicleId )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };
            
    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchMaintenance( this.currentPage, this.limit, this.vehicleId, this.querySearch )

  }
            
            
  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAllByVehicleId( this.currentPage, this.limit, this.vehicleId )
      } else {
        this.searchMaintenance( this.currentPage, this.limit, this.vehicleId, this.querySearch )
      }
  }


  openModalCreate() {
    this.maintenanceSelected = null;
    this.modalService.openModal();
  }


  newMaintenance() {
    this.modalService.closeModal();
    this.getAllByVehicleId( this.currentPage, this.limit, this.vehicleId );
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
      text: `Se marcará como entrada de vehículo.`,
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

          this.getAllByVehicleId( this.currentPage, this.limit, this.vehicleId );

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
