import { Component, ElementRef, ViewChild } from '@angular/core';
import { WorkTool } from '../../../interfaces';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkToolsService } from '../../../services/work-tools.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import { VehiclesService } from '../../../services/vehicles.service';
import { Vehicle } from '../../../interfaces/vehicle.interface';
import { UploadsService } from 'src/app/shared/services/uploads.service';
import Swal from 'sweetalert2';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.scss']
})
export class VehicleDetailsComponent {

  @ViewChild('fileInput', {static: false}) fileInput!: ElementRef;
  
  public vehicle!: Vehicle; 
  public vehicleSelected!: Vehicle;

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;

  public modalSelected: 'image' | 'files' | '' = 'files';

  public validTypes : string[] = ['application/pdf'];

  public messageError: string = '';
  public fileToUpload!: File | null;

  public uploadPolicy: boolean = false;

  constructor( private activatedRoute: ActivatedRoute,
               private vehiclesService: VehiclesService,
               public modalService: ModalService,
               public authService: AuthService,
               public uploadsService: UploadsService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}
               public edit:any;
  ngOnInit(): void {
    this.getVehicle();

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
  }

  getVehicle() {
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.vehiclesService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.vehicle = resp.vehicle;
        this.isLoading = false;
      });
  }


  openModal( vehicle: Vehicle, modalSelected: 'image' | 'files'  ) {
    if ( this.authService.user.role.key != 'admin' ) return;
    this.vehicleSelected = vehicle;
    this.modalSelected = modalSelected;
    this.modalService.openModal();
  }

  closeModal() {
    this.modalSelected = '';
  }


  changeImage( newPicture: string) {
    this.vehicle.image = newPicture;
  }

  openFileInput() {
    this.fileInput.nativeElement.click();
  }


  changeFile( target: EventTarget | null ): void {
    const file = (target as HTMLInputElement).files![0];

    if ( !file ) {
      this.fileToUpload = null;
      return;
    }

    const isValid = this.validateFile(file);

    if ( !isValid ){
      this.fileToUpload = null;
      this.fileInput.nativeElement.value = '';
      return;
    }

    this.fileToUpload = file;

    this.uploadPolicy = true;
   
    this.uploadsService.uploadPolicyFile( this.vehicle.id, this.fileToUpload )
      .subscribe( (resp: any) => {
        this.vehicle.policyFile = resp.filename;

        Swal.fire({
          text: resp.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.uploadPolicy = false;


      })

  }

  validateFile( file: File ): boolean{
    this.messageError = '';
    if (!this.validTypes.includes(file.type) ){
      this.messageError = 'Formato no válido. Debe de ser PDF.';
      return false;
    }
    if ( file.size > 4 * 1024 * 1024 ) {
      this.messageError = 'Tamaño de archivo no válido. Máximo 4MB.';
      return false;
    }
    return true;
  }



}
 