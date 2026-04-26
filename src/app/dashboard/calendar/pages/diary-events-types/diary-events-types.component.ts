import { Component } from '@angular/core';
import { DiaryEnventType } from '../../interfaces/diary-event-type.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { DiaryEventTypesService } from '../../services/diary-events-types.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-diary-events-types',
  templateUrl: './diary-events-types.component.html',
  styleUrls: ['./diary-events-types.component.scss']
})
export class DiaryEventsTypesComponent {

  public diaryEventTypeSelected!: DiaryEnventType | null;
  public diaryEventTypes: DiaryEnventType[] = [];
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 

  constructor( public modalService: ModalService,
               private diaryEventTypesService: DiaryEventTypesService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){

  }
  public create: any;
  public edit:any;
  public deleted:any;

  ngOnInit(): void {
    this.getAllDiaryEventTypes();

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "calendar type")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.deleted =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
  }


  getAllDiaryEventTypes() {
    this.diaryEventTypesService.getAll()
      .subscribe({
        next: ({diaryEventTypes}: any) => {
          this.diaryEventTypes = diaryEventTypes;
          this.totalResults = this.diaryEventTypes.length;
          this.isLoading = false;
        },
    });
  }

  handleCreate() {
    this.modalService.openModal();
    this.diaryEventTypeSelected = null;
  }

  handleUpdate( diaryEnventType: DiaryEnventType ) {
    this.modalService.openModal();
    this.diaryEventTypeSelected = diaryEnventType;
  }

  handleDelete( id: number, idx: number ) {
    this.diaryEventTypesService.remove( id )
      .subscribe({
        next: ( resp ) => {
          this.diaryEventTypes.splice(idx, 1);
          this.totalResults = this.diaryEventTypes.length;

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


  newDiaryEventType() {
    this.modalService.closeModal();
    this.getAllDiaryEventTypes();
  }

}
