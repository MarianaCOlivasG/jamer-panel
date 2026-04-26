import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { WorkTypesService } from '../../services/work-types.service';
import { WorkType } from '../../interfaces/work-type.interface';

@Component({
  selector: 'app-work-types',
  templateUrl: './work-types.component.html',
  styleUrls: ['./work-types.component.scss']
})
export class WorkTypesComponent implements OnInit {

  public workTypeSelected!: WorkType | null;
  public workTypes: WorkType[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 

  constructor( public modalService: ModalService,
               private workTypesService: WorkTypesService ){

  }


  ngOnInit(): void {
    this.getAllWorkTypes();
  }


  getAllWorkTypes() {
    this.workTypesService.getAll()
      .subscribe({
        next: ({workTypes}: any) => {
          this.workTypes = workTypes;
          this.totalResults = this.workTypes.length;
          this.isLoading = false;
        },
    });
  }

  handleCreate() {
    this.modalService.openModal();
    this.workTypeSelected = null;
  }

  handleUpdate( workType: WorkType ) {
    this.modalService.openModal();
    this.workTypeSelected = workType;
  }

  handleDelete( id: number, idx: number ) {
    this.workTypesService.remove( id )
      .subscribe({
        next: ( resp ) => {
          this.workTypes.splice(idx, 1);
          this.totalResults = this.workTypes.length;

          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

        },
        error: ( error ) => {
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


  newWorkTypeEvent() {
    this.modalService.closeModal();
    this.getAllWorkTypes();
  }

}
