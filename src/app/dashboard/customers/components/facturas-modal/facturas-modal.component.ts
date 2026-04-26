import { Component, Input, OnInit, } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Customer } from '../../interfaces';
import { CustomersService } from '../../services/customers.service';
import { environment } from 'src/environments/environment.development';
import Swal from 'sweetalert2';
import { UploadsService } from 'src/app/shared/services/uploads.service';

@Component({
  selector: 'facturas-modal',
  templateUrl: './facturas-modal.component.html',
  styleUrls: ['./facturas-modal.component.scss']
})
export class FacturasModalComponent implements OnInit {

  public fileUrl: string = environment.apiUrl;

  @Input() customerSelected!: Customer;

  public isLoading: boolean = false;
  public facturas: any[] = [];

  public validTypes : string[] = ['application/pdf'];
  public files: any[] = [];
  public tempFiles: any[] = [];



  constructor( private modalService: ModalService,
              private customersService: CustomersService,
              private uploadsService: UploadsService ){}
 
  ngOnInit(): void {
    this.getFacturas();
  }

  getFacturas() {
    this.customersService.getFacturas( this.customerSelected.id ).subscribe({
      next: ( {facturas}: any ) => {
        this.facturas = facturas;
        console.log(this.facturas);
      }
    })
  }

  closeModal() {
    this.modalService.closeModal();
  }


  async handleSubmit() {


    if ( this.files.length == 0 ) return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se subirán nuevas facturas`,
      confirmButtonText: `¡Si, subir!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isLoading = true;

    this.uploadsService.uploadFacturas( this.customerSelected.id, Array.from(this.files) ).subscribe({
      next: (resp: any) => {
        this.tempFiles = [];
        this.files = [];
        Swal.fire({
          text: resp.message,
          icon: 'success',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.getFacturas();
        this.isLoading = false;
      },
      error: (error: any) => {
        Swal.fire({
          text: error.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
        this.isLoading = false;
      }
    })


  }



  validateFile( file: File ): boolean {

    if (!this.validTypes.includes(file.type) ){
      console.log('No es un formato válido')
      return false;
    }

    if ( file.size > 4 * 1024 * 1024 ) {
      console.log('Demasiado pesado')
      return false;
    }
    this.files.push(file);
    return true;
  }

  
  async onSelectFiles( files: any ) {
    for await (const file of Array.from(files)) {
      if ( this.validateFile( file as File ) ) {
        const reader = new FileReader();

        reader.readAsDataURL( file as File );
        reader.onloadend = () => {
          this.tempFiles.push( reader.result);
        }
      }
    }
  }

  async deleteFactura( facturaId: number ) {
    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se eliminará la factura`,
      confirmButtonText: `¡Si, eliminar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;


    this.customersService.deleteFactura( facturaId )
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
          this.getFacturas();
        },
        error: (error: any) => {
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

  deleteFile( id: number ) {
    this.tempFiles.splice(id, 1);
    this.files = this.tempFiles;
  }



}
