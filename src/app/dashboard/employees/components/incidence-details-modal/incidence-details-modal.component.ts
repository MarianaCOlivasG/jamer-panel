import { Component, Input, OnInit } from '@angular/core';
import { Incidence } from '../../interfaces';
import { IncidencesService } from '../../services/incidences.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'incidence-details-modal',
  templateUrl: './incidence-details-modal.component.html',
  styleUrls: ['./incidence-details-modal.component.scss']
})
export class IncidenceDetailsModalComponent  implements OnInit {
  

  @Input() incidenceId!: number;

  public incidence!: Incidence;
  public fileUrl: string = '';


  constructor( private incidencesService: IncidencesService,
               private modalService: ModalService ) {}

  ngOnInit(): void {
    this.incidencesService.getById(this.incidenceId)
      .subscribe( resp => {
        this.incidence = resp.incidence;
        this.fileUrl = `${environment.apiUrl}/uploads/docs/incidences/${this.incidence.file}`
      })
  }


  closeModal() {
    this.modalService.closeModal();
  }



}
