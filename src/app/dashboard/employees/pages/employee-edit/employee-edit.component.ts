import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AccessType, Role } from 'src/app/auth/interfaces';
import { EmployeesService } from '../../services/employees.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { Employee, WorkStation } from '../../interfaces';
import Swal from 'sweetalert2';
import { DatePipe, Location } from '@angular/common';
import { WorkstationService } from '../../services/workstation.service';
import { modules } from '../../interfaces';
import { permissionsMap } from '../../interfaces';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent implements OnInit {

  public employee!: Employee;
  public accessTypes: AccessType[] = [];
  public roles: Role[] = [];
  public workStations: WorkStation[] = [];
  public modules = modules;
  public isLoading: boolean = false;

  public formSubmitted: boolean = false;
  public isUpdating: boolean = false;

  public form: FormGroup = this.fb.group({
    'name': ['', Validators.required ],
    'lastName'  : ['', Validators.required ],
    'phone': ['', [Validators.minLength(10), Validators.maxLength(10)]],
    'cellPhone': ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    'emergencyPhone': ['', [Validators.minLength(10), Validators.maxLength(10)]],
    'email': ['', [Validators.required, Validators.email]],
    'address': [''],
    'color': [''],
    'curp': ['', [Validators.required]],
    'rfc': ['', [Validators.required]],
    'nss': ['', [Validators.required ]],
    'admissionDate': ['', [Validators.required]],
    'dismissalDate': [''],
    'workstation': ['', Validators.required],
    'permissions': this.fb.array([])
  });

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private workStationsService: WorkstationService,
  private location: Location,

    private localStorageService: LocalStorageService,
  
  ){}

  ngOnInit(): void {

    combineLatest([   
      this.authService.getAllAccessTypes(),
      this.authService.getAllRoles(),
      this.workStationsService.getAll(),
    ])
    .subscribe( combined => {
      this.accessTypes = combined[0].accessTypes;
      this.roles = combined[1].roles;
      this.workStations = combined[2].workStations;
    });

    this.isLoading = true;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.employeesService.getById(id) )
      ).subscribe( (resp: any) =>{
        this.employee = resp.employee;

        const { 
          name,
          lastName,
          phone,
          cellPhone,
          email,
          address,
          workstation,
          admissionDate,
          dismissalDate,
          curp,
          rfc,
          nss,
          color,
          emergencyPhone } = this.employee;

        const datePipe = new DatePipe("en-US");

        this.form.patchValue({
          name,
          lastName,
          phone,
          cellPhone,
          emergencyPhone,
          email,
          address,
          workstation,
          admissionDate: datePipe.transform(admissionDate, 'yyyy-MM-dd'),
          dismissalDate: dismissalDate ? datePipe.transform(dismissalDate, 'yyyy-MM-dd') : '',
          curp,
          rfc,
          nss,
          color
        });
        this.initPermissionsForm(resp.employee.permissions);
        this.isLoading = false;
      });

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const employees = (storedPermissions?.find((p)=> p.page == "employees")?.permissions );
    ((employees as number >> 2 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    
  }
  
  get permissionsFormArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  initPermissionsForm(existingPermissions: any) {
    const modulesFormArray = this.permissionsFormArray;

    this.modules.forEach(module => {
      const moduleGroup = this.fb.group({});
      module.permissions.forEach(perm => {
        moduleGroup.addControl(perm.name, this.fb.control(false));
      });
      modulesFormArray.push(moduleGroup);
    });

    existingPermissions.forEach((perm: any) => {
      const moduleIndex = this.modules.findIndex(m => m.name === perm.page);
      if (moduleIndex !== -1) {
        const moduleGroup = this.permissionsFormArray.at(moduleIndex) as FormGroup;
        const permValue = parseInt(perm.permissions, 10);

        this.modules[moduleIndex].permissions.forEach((permDef: { name: string; }) => {
          if ( (permValue & permissionsMap[permDef.name as keyof typeof permissionsMap]) !== 0 ) {
            moduleGroup.get(permDef.name)?.setValue(true);
          }
        });
      }
    });
  }

  getSelectedPermissions(): { [key: string]: number } {
    const selectedPermissions: { [key: string]: number } = {};

    this.permissionsFormArray.controls.forEach( (moduleGroup, index: number) => {
      const modulePermissions = (moduleGroup as FormGroup).value;
      let permissionsValue = 0;

      Object.keys(modulePermissions).forEach(permName => {
        if (modulePermissions[permName]) {
          permissionsValue += permissionsMap[permName as keyof typeof permissionsMap];
        }
      });

      selectedPermissions[this.getModuleName(index)] = permissionsValue;
    });

    return selectedPermissions;
  }

  getModuleName(index: number): string {
    return this.modules[index]?.name || '';
  }

  handleSubmit() {      
    this.formSubmitted = true;
    if ( this.form.invalid ) return;
  
    this.isUpdating = true;
    const data = {
      employee: this.form.value,
      permissions: this.getSelectedPermissions()
    };
    this.employeesService.update( this.employee.id, data )
      .subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isUpdating = false;
          this.router.navigate(['employees']);
        },
        error: (error: any) => {
          console.log(error);
          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isUpdating = false;
        }
      });
  }

  inputInvalid( campo: string ): boolean {
    if ( this.form.get(campo)?.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }
  }

  errorMessage( campo: string ): string {
    return this.form.get(campo)?.hasError('required') ? `Este campo es requerido.` :
        this.form.get(campo)?.hasError('email') ? `Correo electrónico inválido.` :
        this.form.get(campo)?.hasError('minlength') ? `Mínimo ${this.form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.` :
        this.form.get(campo)?.hasError('maxlength') ? `Máximo ${this.form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.` : '';
  }

  goToBack( ) {
    this.location.back()
  }
  toggleSelectAllModule(event: Event, moduleIndex: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const moduleGroup = this.permissionsFormArray.at(moduleIndex) as FormGroup;
    Object.keys(moduleGroup.controls).forEach(controlName => {
      moduleGroup.get(controlName)?.setValue(isChecked);
    });
  }

  toggleSelectAllGlobal(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.permissionsFormArray.controls.forEach((moduleGroup: AbstractControl) => {
      const group = moduleGroup as FormGroup;
      Object.keys(group.controls).forEach(controlName => {
        group.get(controlName)?.setValue(isChecked);
      });
    });
  }

  isAllSelectedModule(moduleIndex: number): boolean {
    const moduleGroup = this.permissionsFormArray.at(moduleIndex) as FormGroup;
    return Object.values(moduleGroup.value).every(value => value === true);
  }

  isAllSelectedGlobal(): boolean {
    return this.permissionsFormArray.controls.every((moduleGroup: AbstractControl) => {
      const group = moduleGroup as FormGroup;
      return Object.values(group.value).every(value => value === true);
    });
  }

}
