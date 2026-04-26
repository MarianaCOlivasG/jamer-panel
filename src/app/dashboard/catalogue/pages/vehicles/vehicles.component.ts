import { Component } from '@angular/core';
import { WorkTool } from '../../interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import { WorkToolsService } from '../../services/work-tools.service';
import { combineLatest } from 'rxjs';
import { Vehicle } from '../../interfaces/vehicle.interface';
import { VehiclesService } from '../../services/vehicles.service';
import Swal from 'sweetalert2';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent {

  public vehicles: Vehicle[] = [];

  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public vehicleSelected: Vehicle | null = null;
  public currentTechnicals: number[] = [];

  public vehiculeId: number = 0;

  constructor(  public authService: AuthService,
                private vehiclesService: VehiclesService,
                public modalService: ModalService,
                private localStorageService: LocalStorageService,
                private router: Router,
                ){}
                public create: any;
                public edit:any;
                public deleted:any;
  ngOnInit(): void {
      this.getVehicles();

      
    
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
  }

  
  getVehicles() {
    this.isLoading = true;
    this.vehiclesService.getAll(
      this.currentPage, 
      this.limit, 
    )
      .subscribe({
        next: (resp: any) => {
          this.vehicles = resp.vehicles;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchVehicles() {
    this.isLoading = true;
    this.vehiclesService.search(
      this.currentPage, 
      this.limit, 
      this.querySearch
    )
      .subscribe({
        next: (resp: any) => {
          console.log(resp)
          this.vehicles = resp.vehicles;
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
      this.getVehicles();
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchVehicles()

  }




  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getVehicles();
      } else {
        this.searchVehicles();
      }
  }


  changeModel( formName: string ) {

    this.currentPage = 1;
    this.isSuggestions = false;

    this.getVehicles();
  }

  disableOrEnable( vehicle: any ) {

    this.vehiclesService.disableOrEnable( vehicle.id )
        .subscribe({
          next: ( resp: any ) => {

            this.isLoading = false;

            this.isSuggestions = false;
            this.querySearch = '';
            this.getVehicles();

            Swal.fire({
              icon: 'success',
              text: resp.message,
              allowEscapeKey: false,
              allowOutsideClick: false,
              timer: 2500,
              showConfirmButton: false
            })

          },
          error: ( error ) => {

            this.isLoading = false;

            Swal.fire({
              text: error.error.message,
              icon: 'error',
              allowEscapeKey: false,
              allowOutsideClick: false,
              timer: 2500,
              showConfirmButton: false
            });
          }
        })

  }


  assingToEvent() {
    this.vehicleSelected = null;
    this.modalService.closeModal();
    this.changePage( this.currentPage );
  }


  openModal( vehicle: Vehicle ) {
    this.vehicleSelected = vehicle;
    this.modalService.openModal();
  }

  closeModal() {
      this.vehicleSelected = null;
  }


  removeAssignTo( vehiculeId: number ) {

    this.vehiculeId = vehiculeId;

    this.vehiclesService.assignTo( this.vehiculeId, 0 )
    .subscribe({
      next: (resp: any) => {
        Swal.fire({
          text: resp.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.vehiculeId = 0;

        this.changePage( this.currentPage );
      },
      error: (error) => {
        Swal.fire({
          text: error.error.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.vehiculeId = 0;
      }
    })
  }

}
