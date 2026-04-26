import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';
import Swal from 'sweetalert2';
import { InfoService } from './services/info.service';
import { Info } from './interfaces/info.interface';
import { Location } from '@angular/common';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;
  public isSaving: boolean = false;

  public info!: Info;
  public sanitarySignature: string = '';

  public form: FormGroup = this.fb.group({
    companyName: ['', Validators.required],
    sanitaryLicense: ['', Validators.required],
    bossName: ['', Validators.required],
    address_street: ['', Validators.required],
    address_cp: ['', Validators.required],
    address_state: ['', Validators.required],
    address_municipality: ['', Validators.required],
    address_colony: [''],
  });
  public base64Image: string = '';

  constructor(
    private fb: FormBuilder,
    private infoService: InfoService,
    private location: Location
  ) {}

  ngOnInit(): void {
    combineLatest([this.infoService.getInfo()]).subscribe(([data]) => {
      this.info = data.info;
      const {
        companyName,
        sanitaryLicense,
        bossName,
        address_street,
        address_cp,
        address_state,
        address_municipality,
        address_colony,
        sanitarySignature
      } = this.info;
      this.base64Image = atob(this.info.sanitarySignature);
      this.form.setValue({
        companyName,
        sanitaryLicense,
        bossName,
        address_street,
        address_cp,
        address_state,
        address_municipality,
        address_colony: address_colony || ''
      });

      this.sanitarySignature = sanitarySignature || '';
    });
  }

  onSanitarySignature(event: { signature: string; rating: number }): void {
    this.sanitarySignature = event.signature;
  }

  inputInvalid(campo: string): boolean {
    return !!(
      this.form.get(campo)?.invalid &&
      this.formSubmitted
    );
  }

  errorMessage(campo: string): string {
    return this.form.get(campo)?.hasError('required')
      ? 'Este campo es requerido.'
      : '';
  }

  async handleSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (this.form.invalid) return;

    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se actualizará la información',
      confirmButtonText: '¡Si, actualizar!',
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });

    if (!isConfirmed) return;

    this.isSaving = true;

    const bodyToSend = {
      ...this.form.value,
      sanitarySignature: this.sanitarySignature
    };

    this.infoService.update(1, bodyToSend).subscribe({
      next: (resp) => {
        Swal.fire({
          text: resp.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        }).then(() => {
          window.location.reload();
        });
        this.isSaving = false;
      },
      error: (error) => {
        Swal.fire({
          text: error.error.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        }).then(() => {
        });
        this.isSaving = false;
      }
    });
  }

  goToBack() {
    this.location.back();
  }
}