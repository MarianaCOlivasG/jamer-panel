import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { WorkOrdersSolutionsService } from '../../services/work-orders-solutions.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WorkOrdersService } from '../../services/work-orders.service';
import { lastValueFrom } from 'rxjs';
import { WorkOrder } from '../../interfaces/work-order.interface';
 
@Component({
  selector: 'app-FormEvidencias',
  templateUrl: './FormEvidencias.component.html',
  styleUrls: ['./FormEvidencias.component.scss']
})
export class FormEvidenciasComponent implements OnInit {

  public isSaving = false;
  public formSubmitted = false;
  public workOrder!: WorkOrder;
  public products: any[] = [];
  public paymentMethods: string[] = [
    'Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Transferencia', 'Cheque', 'Por definir'
  ];
  public validTypes: string[] = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
  public files: File[] = [];
  public tempFiles: any[] = [];
  public errorMessageText = '';
  private storeId = 0;

  public form: FormGroup = this.fb.group({
 
    workOrderId: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,

    private workOrdersService: WorkOrdersService,
    private workOrdersSolutionsService: WorkOrdersSolutionsService,

    private router: Router,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(({ id }) => {
      this.getWorkOrder(+id);
      this.form.get('workOrderId')?.setValue(id);
    });
  }

  getWorkOrder(workOrderId: number) {
    this.workOrdersService.getById(workOrderId).subscribe(resp => {
      this.workOrder = resp.workOrder;
    });
  }
  clickDisabled = false;

  async handleSubmit(event: Event) {    
    event.preventDefault();
    if (this.clickDisabled) return;
    
    this.formSubmitted = true;
    if (this.form.invalid) {
      return;
    }
    
    await this.create();
  }

  async create() {
    if (this.tempFiles.length > 5) {
      this.showError('No puedes subir más de 5 imágenes.');
      return;
    }
  
    this.isSaving = true;
    this.clickDisabled = true;
  
    // Mostrar SweetAlert con barra de progreso
    const swalInstance = Swal.fire({
      title: 'Procesando',
      html: `
        <div>Guardando la solución...</div>
        <div class="mt-3">Subiendo archivos: <span id="file-count">0/${this.files.length}</span></div>
        <div class="progress mt-2">
          <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%"></div>
        </div>
      `,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      backdrop: true,
      customClass: {
        popup: 'swal-wide', // Agrega esta clase para hacerlo más ancho
        htmlContainer: 'text-left' // Alinea el texto a la izquierda
      }
    });
  
    try {

  
      // Subir archivos uno por uno si existen
      if (this.files.length > 0) {
        const totalFiles = this.files.length;
        let uploadedCount = 0;
        
        for (const file of this.files) {
          // Actualizar el contador en SweetAlert
          const fileCountElement = document.getElementById('file-count');
          if (fileCountElement) {
            fileCountElement.textContent = `${uploadedCount + 1}/${totalFiles}`;
          }
  
          // Subir el archivo individualmente
          await lastValueFrom(
            this.workOrdersSolutionsService.uploadFile(
              this.form.get('workOrderId')?.value,
              file,
              (progress) => {
                // Actualizar barra de progreso
                const progressBar = document.getElementById('progress-bar');
                if (progressBar) {
                  progressBar.style.width = `${progress}%`;
                  progressBar.textContent = `${progress}%`;
                }
              }
            )
          );
          
          uploadedCount++;
        }
      }
      // Cerrar SweetAlert
      Swal.close();
      this.router.navigateByUrl(`/work-orders/details/${this.form.get('workOrderId')?.value}`, { replaceUrl: true });
  
    } catch (error) {
      Swal.close();
      console.error('Error:', error);
      this.showError(error instanceof Error ? error.message : 'Ocurrió un error al procesar la solución.');
    }
    finally {
      this.isSaving = false;
      this.clickDisabled = false;
    }
  }



  inputInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && (control.touched || this.formSubmitted));
  }

  errorMessage(campo: string): string {
    const control = this.form.get(campo);
    
    if (!control) return 'Campo inválido';
    
    if (control.hasError('required')) {
      return 'Este campo es requerido';
    } else if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    } else if (control.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    return '';
  }

  trackByProductId(index: number, product: any): number {
    return product.id;
  }


  onSelectFiles(files: FileList | null) {
    if (!files) return;
    if (this.tempFiles.length >= 5) {
      this.errorMessageText = 'Límite máximo: 5 imágenes';
      return;
    }

    this.errorMessageText = '';
    for (const file of Array.from(files)) {
      if (this.tempFiles.length >= 5) break;
      
      if (this.validateFile(file)) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          this.tempFiles.push(reader.result);
        };
      }
    }
  }

  validateFile(file: File): boolean {
    if (!this.validTypes.includes(file.type)) {
      this.errorMessageText = 'Solo se permiten imágenes (JPG, PNG, GIF)';
      return false;
    }
    if (file.size > 4 * 1024 * 1024) {
      this.errorMessageText = 'El archivo es demasiado pesado (máximo 4MB)';
      return false;
    }
    this.files.push(file);
    return true;
  }

  deleteImage(index: number) {
    this.tempFiles.splice(index, 1);
    this.files.splice(index, 1);
  }


  private showError(message: string) {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6'
    });
  }
}