import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { EmployeesService } from '../../services/employees.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AccessType, Role } from 'src/app/auth/interfaces';
import { combineLatest } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { WorkstationService } from '../../services/workstation.service';
import { Location } from '@angular/common';
import { WorkStation, modules } from '../../interfaces';
import { permissionsMap, PermissionName } from '../../interfaces';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {

  public createUser: boolean = true;
  public accessTypes: AccessType[] = [];
  public roles: Role[] = [];
  public workStations: WorkStation[] = [];

  public formSubmitted: boolean = false;
  public isLoading: boolean = false;

  public showPassword: boolean = false;

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
    'workstation': ['', Validators.required],
  });

  public formAuth: FormGroup = this.fb.group({
    'userName': ['', Validators.required ],
    'password': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(13)]],
    'accessTypeId': ['', Validators.required ],
  });

  constructor( private fb: FormBuilder,
               private employeesService: EmployeesService,
               private authService: AuthService,
               private router: Router,
               private workStationsService: WorkstationService,
              private location: Location,
              private localStorageService: LocalStorageService,

              ){}
  permissionsForm!: FormGroup;
  modules = modules;

 

  ngOnInit(): void {
    combineLatest([   
      this.authService.getAllAccessTypes(),
      this.authService.getAllRoles(),
      this.workStationsService.getAll()
    ])
    .subscribe( combined => {
      this.accessTypes = combined[0].accessTypes;
      this.roles = combined[1].roles;
      this.workStations = combined[2].workStations;
      this.onAccessTypeChange();
    });
    this.permissionsForm = this.fb.group({
      modules: this.fb.array([]),
    });

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const employees = (storedPermissions?.find((p)=> p.page == "employees")?.permissions );
    ((employees as number >> 1 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
    this.initPermissionsForm();
  }

  get modulesFormArray(): FormArray {
    return this.permissionsForm.get('modules') as FormArray;
  }
  setPermissionsForModules(moduleNames: string[], isSelected: boolean) {
    moduleNames.forEach(moduleName => {
      const moduleIndex = this.modules.findIndex(m => m.name === moduleName);
      if (moduleIndex !== -1) {
        const moduleGroup = this.modulesFormArray.at(moduleIndex) as FormGroup;
        Object.keys(moduleGroup.controls).forEach(controlName => {
          moduleGroup.get(controlName)?.setValue(isSelected);
        });
      }
    });
  }
  onAccessTypeChange() {
    this.formAuth.get('accessTypeId')?.valueChanges.subscribe(value => {
     
      const selectedAccessType = this.accessTypes.find(at => at.id == value);
      if (selectedAccessType && selectedAccessType.value === 'Técnicos App') {
        this.setPermissionsForModules(['store', 'work orders'], true);
      } 
      // else {
      //   this.setPermissionsForModules(['store', 'work orders'], false);
      // }
    });
  }
    
  initPermissionsForm() {
    const modulesFormArray = this.permissionsForm.get('modules') as FormArray;
    this.modules.forEach((module) => {
      const permissionsGroup = this.fb.group({});
      module.permissions.forEach((perm) => {
        permissionsGroup.addControl(perm.name, this.fb.control(false));
      });
      modulesFormArray.push(permissionsGroup);
    });
  }

  handleSubmit() {
    if ( !this.createUser ) {
      this.createEmployee();
      return;
    } 
    this.createEmployeeWithUser();
  }

  createEmployee() {
    this.formSubmitted = true;
    if ( this.form.invalid ) return;
    this.isLoading = true;
    this.employeesService.create( this.form.value )
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
          this.router.navigate(['employees','edit', resp.employee.id])
        },
        error: (error: any) => {
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
      });
  }

  createEmployeeWithUser() {
    this.formSubmitted = true;
    if ( this.form.invalid || this.formAuth.invalid ) return;
    this.isLoading = true;
    const data = {
      employee: {...this.form.value },
      user: {roleId:"1",...this.formAuth.value },
      permissions: this.getSelectedPermissions()
    }
    this.employeesService.createWithUser( data )
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
          this.router.navigate(['employees'])
        },
        error: (error: any) => {
          console.log(error)
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
      });
  }

  getSelectedPermissions(): { [key: string]: number } {
    const selectedPermissions: { [key: string]: number } = {};
    const modulesFormArray = this.modulesFormArray;

    modulesFormArray.controls.forEach((moduleGroup, index: number) => {
      const module = this.modules[index];
      const moduleName = module.name;
      const modulePermissions = (moduleGroup as FormGroup).value;

      let permissionsValue = 0;
      module.permissions.forEach((perm) => {
        const permissionName = perm.name as PermissionName;
        if (modulePermissions[permissionName]) {
          permissionsValue += permissionsMap[permissionName];
        }
      });

      selectedPermissions[moduleName] = permissionsValue;
    });

    return selectedPermissions;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('inputPassword') as HTMLInputElement;
    passwordInput.type = this.showPassword ? 'text' : 'password';
  }

  toggleSelectAllModule(event: Event, moduleIndex: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const moduleGroup = this.modulesFormArray.at(moduleIndex) as FormGroup;
    Object.keys(moduleGroup.controls).forEach(controlName => {
      moduleGroup.get(controlName)?.setValue(isChecked);
    });
  }

  toggleSelectAllGlobal(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.modulesFormArray.controls.forEach((moduleGroup: AbstractControl) => {
      const group = moduleGroup as FormGroup;
      Object.keys(group.controls).forEach(controlName => {
        group.get(controlName)?.setValue(isChecked);
      });
    });
  }

  isAllSelectedModule(moduleIndex: number): boolean {
    const moduleGroup = this.modulesFormArray.at(moduleIndex) as FormGroup;
    return Object.values(moduleGroup.value).every(value => value === true);
  }

  isAllSelectedGlobal(): boolean {
    return this.modulesFormArray.controls.every((moduleGroup: AbstractControl) => {
      const group = moduleGroup as FormGroup;
      return Object.values(group.value).every(value => value === true);
    });
  }

  inputInvalid( campo: string, form: FormGroup ): boolean {
    if ( form.get(campo)?.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }
  }

  errorMessage( campo: string, form: FormGroup  ): string {
    return form.get(campo)?.hasError('required') ? `Este campo es requerido.` :
           form.get(campo)?.hasError('pattern') ? `Campo inválido.` :
           form.get(campo)?.hasError('email') ? `Correo electrónico inválido.` :
           form.get(campo)?.hasError('minlength') ? `Mínimo ${form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.` :
           form.get(campo)?.hasError('maxlength') ? `Máximo ${form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.` : '';
  }


  goToBack() {
    this.location.back();
  }

}
