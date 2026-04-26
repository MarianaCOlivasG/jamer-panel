import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { WorkStation } from '../../interfaces';
import { WorkstationService } from '../../services/workstation.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-workstation',
  templateUrl: './workstation.component.html',
  styleUrls: ['./workstation.component.scss']
})
export class WorkstationComponent implements OnInit {

  public workStationSelected!: WorkStation | null;
  public workStations: WorkStation[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 

  constructor( public modalService: ModalService,
               private workStationsService: WorkstationService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}

               public create: any;
               public edit:any;
               public deleted:any;
  ngOnInit(): void {
    this.getAllWorkStations();

    
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "workStation")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
  }


  getAllWorkStations() {
    this.workStationsService.getAll()
      .subscribe({
        next: ({workStations}: any) => {
          this.workStations = workStations;
          this.totalResults = this.workStations.length;
          this.isLoading = false;
        },
    });
  }

  handleCreate() {
    this.modalService.openModal();
    this.workStationSelected = null;
  }

  handleUpdate( workStation: WorkStation ) {
    this.modalService.openModal();
    this.workStationSelected = workStation;
  }

  handleDelete( id: number, idx: number ) {
    this.workStationsService.remove( id )
      .subscribe({
        next: ( resp ) => {
          this.workStations.splice(idx, 1);
          this.totalResults = this.workStations.length;

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


  newWorkStationEvent() {
    this.modalService.closeModal();
    this.getAllWorkStations();
  }

}
