import { Component } from '@angular/core';
import { EmployeesService } from '../../services/employees.service';
import { Employee } from '../../interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';
import Swal from 'sweetalert2';
import { ModalService } from 'src/app/shared/services/modal.service';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent {

  public availableDevices!: MediaDeviceInfo[];
  public deviceCurrent!: MediaDeviceInfo | undefined;
  public deviceSelected!: string;
  public storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  hasDevices!: boolean;
  hasPermission!: boolean;

  qrResultString!: string;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
  }

  onDeviceSelectChange(selected: string) {
    const selectedStr = selected || '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.deviceCurrent = device || undefined;
  }

  onDeviceChange(device: MediaDeviceInfo) {
    const selectedStr = device?.deviceId || '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    this.deviceCurrent = device || undefined;
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }



  public employees: Employee[] = [];
  public employeeSelected!: Employee;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public modalSelected: 'password' | 'credentials' = 'password';


  constructor( private employeesService: EmployeesService,
               public authService: AuthService,
               public modalService: ModalService,
               private router: Router,
               private localStorageService: LocalStorageService,

               ) {
  }
  public createUser: any;
  public editUser:any;
  public toolsUser:any;
  public calendaryUser:any
  ngOnInit(): void {
    this.getAll( this.currentPage, this.limit )
   
    const employees = (this.storedPermissions?.find((p)=> p.page == "employees")?.permissions );
  ((employees as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
   this.createUser =  ((employees as number >> 1 ) % 2 == 1)? true :false; 
   this.editUser =  ((employees as number >> 2 ) % 2 == 1)? true :false; 
   this.toolsUser =  ((employees as number >> 3 ) % 2 == 1)? true :false; 
   this.calendaryUser =  ((employees as number >> 4 ) % 2 == 1)? true :false; 

  }

  getAll( page: number, limit: number) {
    this.isLoading = true;
    this.employeesService.getAll(page, limit)
      .subscribe({
        next: (resp: any) => {
          this.employees = resp.employees;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  searchEmployees( page: number, limit: number, queryString: string) {
    this.isLoading = true;
    this.employeesService.search(page, limit, queryString)
      .subscribe({
        next: (resp: any) => {
          this.employees = resp.employees;
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
    this.searchEmployees( this.currentPage, this.limit, this.querySearch )

  }


  changePage( currentPage: number ) {
      this.currentPage = currentPage;

      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit )
      } else {
        this.searchEmployees( this.currentPage, this.limit, this.querySearch )
      }
  }


  async disableOrEnable( employee: Employee ) {

    const { isActive, uid } = employee.user;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Estás seguro que deseas ${ !isActive ? 'habilitar' : 'deshabilitar' } la cuenta del empleado?`,
      confirmButtonText: `¡Si, ${ !isActive ? 'habilitar' : 'deshabilitar' }!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.authService.disableOrEnable( uid )
      .subscribe({
        next: (resp: any) => {
          Swal.fire({
            icon: 'success',
            text: resp.message,
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          })
          employee.user.isActive = !isActive;
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
        }
      })

  }

  openModal( employee: Employee, modalSelected: 'password' | 'credentials' ) {
    this.modalSelected = modalSelected;
    this.employeeSelected = employee;
    this.modalService.openModal();
  }


  newCredentials() {
    if ( !this.isSuggestions ) {
      this.getAll( this.currentPage, this.limit )
    } else {
      this.searchEmployees( this.currentPage, this.limit, this.querySearch )
    }
  }

  
}
