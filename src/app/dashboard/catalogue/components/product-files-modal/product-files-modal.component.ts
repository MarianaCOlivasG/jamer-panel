import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Product } from '../../interfaces';
import { ModalService } from 'src/app/shared/services/modal.service';
import { UploadsService } from 'src/app/shared/services/uploads.service';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'product-files-modal',
  templateUrl: './product-files-modal.component.html',
  styleUrls: ['./product-files-modal.component.scss']
})
export class ProductFilesModalComponent {

  @Input() product!: Product;
  @ViewChild('fileInput', {static: false}) fileInput!: ElementRef;

  @Output() newFileEvent = new EventEmitter<null>();
  @Output() closeModalEvent = new EventEmitter<null>();


  public pFiles!: FileList | null;
  public pFilesToUpload: File[] = [];

  public validTypes : string[] = ['application/pdf'];

  public isValidTypeFile: boolean = false;
  public isValidSizeFile: boolean = false;

  public isLoading: boolean = false;

  public limitFiles: number = 8;

  constructor( private modalService: ModalService,
               private uploadsService: UploadsService ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  
  changeFile( target: EventTarget | null ): void {

    this.isValidTypeFile = false;
    this.isValidSizeFile = false;


    this.pFiles = (target as HTMLInputElement).files!;

    if ( this.pFiles.length == 0 ) {
      return;
    }

    const diff = this.limitFiles - this.product.productFiles.length;

    for (let i = 0; i < this.pFiles.length; i++) {
      if ( this.validateFile(this.pFiles.item(i)!) ) {

        if ( this.pFilesToUpload.length == diff ) {
          return;
        }

        this.pFilesToUpload.push(this.pFiles.item(i)!)
      }
    }


  }


  validateFile( file: File ): boolean{

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
      return this.isValidTypeFile ? 'Alguno de los archivo tiene un formato inválido.' : 
             this.isValidSizeFile ? 'Alguno de los archivo excede el limite de tamaño. Máximo 4MB.' : '';
  }


  async uploadImage() {

    this.isLoading = true;

    try {

      for await (const file of this.pFilesToUpload) {
        const files$ = this.uploadsService.uploadPFileProduct( this.product.id, file );
        await lastValueFrom(files$);
      }

      Swal.fire({
        icon: 'success',
        text: 'Expediente actualizado con éxito.',
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2500,
        showConfirmButton: false
      })

      this.isLoading = false;
      this.pFilesToUpload = [];
      this.newFileEvent.emit();

    } catch (error: any) {
      Swal.fire({
          text: error.error.message,
          icon: 'error',
          allowEscapeKey: false,
          allowOutsideClick: false,
          timer: 2500,
          showConfirmButton: false
        });
      }
  }


  removeFileItem( idx: number ) {
    this.pFilesToUpload.splice(idx, 1); 
  }

}
