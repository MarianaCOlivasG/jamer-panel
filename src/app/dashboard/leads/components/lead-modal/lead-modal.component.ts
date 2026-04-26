import { Component, Input } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Lead } from '../../interfaces';

@Component({
  selector: 'lead-modal',
  templateUrl: './lead-modal.component.html',
  styleUrls: ['./lead-modal.component.scss']
})
export class LeadModalComponent {

  @Input() lead!: Lead;

  constructor( private modalService: ModalService ){}
 
  closeModal() {
    this.modalService.closeModal();
  }



}
