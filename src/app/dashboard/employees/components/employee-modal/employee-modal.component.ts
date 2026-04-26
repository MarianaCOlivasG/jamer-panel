import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Employee } from '../../interfaces';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UploadsService } from 'src/app/shared/services/uploads.service';

@Component({
  selector: 'employee-modal',
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent {

  @Input() employee!: Employee;
  @ViewChild('fileInput', {static: false}) fileInput!: ElementRef;
  @Output() newPictureEvent = new EventEmitter<string>();

  public file!: File | null;
  public fileTemp!: string | ArrayBuffer | null;

  public validTypes : string[] = ['image/jpg', 'image/jpeg','image/png', 'image/gif'];

  public isValidTypeFile: boolean = false;
  public isValidSizeFile: boolean = false;

  public isLoading: boolean = false;

  constructor( private modalService: ModalService,
               private uploadsService: UploadsService ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.modalService.closeModal();
  }

  
  changeFile( target: EventTarget | null ): void {

    this.file = (target as HTMLInputElement).files![0];

    if ( !this.file ) {
      this.fileTemp = null;
      return;
    }

    const isValid = this.validateFile(this.file);

    if ( !isValid ){
      this.file = null;
      this.fileTemp = null;
      this.fileInput.nativeElement.value = '';
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL( this.file );
    reader.onloadend = () => {
      this.fileTemp = reader.result;
    }


  }



  validateFile( file: File ): boolean{

    this.isValidTypeFile = false;
    this.isValidSizeFile = false;

    if (!this.validTypes.includes(file.type) ){
      this.isValidTypeFile = true;
      return false;
    }

    if ( file.size > 4 * 1024 * 1024 ) {
      this.isValidSizeFile = true;
      return false;
    }

    return true;
  }


  errorMessage(): string {
      return this.isValidTypeFile ? 'Formato inválido.' : 
             this.isValidSizeFile ? 'Tamaño de archivo no válido. Máximo 4MB.' : '';
  }




  uploadImage() {

    this.isLoading = true;

    this.uploadsService.uploadPicture( this.employee.id, this.file! )
      .subscribe({
        next: (resp: any) => {

          this.isLoading = false;
          
          this.newPictureEvent.emit(resp.filename);

          Swal.fire({
            icon: 'success',
            text: resp.message,
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          })

        },
        error: (error) => {
          
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

}
