import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WorkOrdersSolutionsService } from '../../services/work-orders-solutions.service';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { WorkOrderSolution } from '../../interfaces/work-order-solution.interface';

@Component({
  selector: 'app-work-order-solution-form',
  templateUrl: './work-order-solution-form.component.html',
  styleUrls: ['./work-order-solution-form.component.scss']
})
export class WorkOrderSolutionFormComponent implements OnInit {

  private workOrderSolution!: WorkOrderSolution;
  public workOrderId: number = 0;
  public isLoading: boolean = false;
  public formSubmitted: boolean = false;
  public isSaving: boolean = false;
  public isEdit: boolean = false;

  public form: FormGroup = this.fb.group({
    description: ['', Validators.required],
    evaluation: ['', Validators.required],
    deficiencies: ['', Validators.required],
    pest_detected: ['', Validators.required],
    work_done: ['', Validators.required],
    products: this.fb.array([])
  });

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private workSolutionService: WorkOrdersSolutionsService,
    private location: Location,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
    const permissions = storedPermissions?.find((p) => p.page === "work orders")?.permissions;
    if (!((permissions as number >> 2) % 2 === 1 || (permissions as number >> 1) % 2 === 1)) {
      this.router.navigate(['/calendar/my-calendar']);
    }
    this.activatedRoute.params.subscribe(({ id }) => {
      this.workOrderId = +id;
      this.getWorkSolution(+id);
    });
  }

  getWorkSolution(id: number) {
    this.isLoading = true;
    this.workSolutionService.getById(id)
      .subscribe(resp => {
        this.workOrderSolution = resp.workOrderSolution;
        const { description, evaluation, deficiencies, pest_detected, work_done } = this.workOrderSolution;
        this.form.patchValue({
          description,
          evaluation,
          deficiencies,
          pest_detected,
          work_done,
        });
        if ((this.workOrderSolution as any).workOrderSolutionsProducts) {
          (this.workOrderSolution as any).workOrderSolutionsProducts.forEach((prod: any) => {
            this.addProduct({
              id: prod.productId,
              name: prod.product.name,
              businessLine: prod.product.businessLine?.name || '',
              businessFamily: prod.product.businessFamily?.name || '',
              amount: prod.amount,
              unit: prod.unit
            });
          });
        }
        this.isLoading = false;
      });
  }

  get productsArray(): FormArray {
    return this.form.get('products') as FormArray;
  }

  addProduct(productData: any): void {
    const existingIndex = this.productsArray.value.findIndex(
      (prod: any) => prod.id === productData.id
    );

    if (existingIndex !== -1) {
      const currentAmount = this.productsArray.at(existingIndex).get('amount')?.value || 0;
    const newAmount = parseInt(currentAmount) + parseInt((productData.amount || 1));
      this.productsArray.at(existingIndex).patchValue({ amount: newAmount });
      return;
    }

    const productGroup = this.fb.group({
      id: [productData.id || null],
      name: [productData.name || '', Validators.required],
      businessLine: [productData.businessLine || '', Validators.required],
      businessFamily: [productData.businessFamily || '', Validators.required],
      amount: [productData.amount || 0, [Validators.required, Validators.min(1)]],
      unit: [productData.unit || '', Validators.required]
    });

    this.productsArray.push(productGroup);
  }

  removeProduct(index: number): void {
    this.productsArray.removeAt(index);
  }

  async handleSubmit() {
    this.formSubmitted = true;
    if (this.form.invalid) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se actualizará la información de la orden de trabajo`,
      confirmButtonText: `¡Si, actualizar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    });
    if (!isConfirmed) return;

    this.isSaving = true;
    this.update();
  }

  update(): void {
    const formData = {
      ...this.form.value
    };

    this.workSolutionService.update(this.workOrderId, formData)
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
          });
          this.isSaving = false;
        }
      });
  }

  inputInvalid(campo: string): boolean | undefined {
    return this.form.get(campo)?.invalid && this.formSubmitted;
  }

  errorMessage(campo: string): string {
    if (this.form.get(campo)?.hasError('required')) {
      return `Este campo es requerido.`;
    }
    if (this.form.get(campo)?.hasError('email')) {
      return `Correo electrónico inválido.`;
    }
    if (this.form.get(campo)?.hasError('minlength')) {
      return `Mínimo ${this.form.get(campo)?.errors!['minlength']['requiredLength']} caracteres.`;
    }
    if (this.form.get(campo)?.hasError('maxlength')) {
      return `Máximo ${this.form.get(campo)?.errors!['maxlength']['requiredLength']} caracteres.`;
    }
    if (this.form.get(campo)?.hasError('min')) {
      return `La cantidad debe ser mayor que 0.`;
    }
    return '';
  }

  goToBack(): void {
    this.location.back();
  }
}