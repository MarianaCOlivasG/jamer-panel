import { Component, Input, OnInit } from '@angular/core';
import { Bonus } from '../../interfaces';
import { IncidencesService } from '../../services/incidences.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { environment } from 'src/environments/environment.development';
import { BonusesService } from '../../services/bonuses.service';

@Component({
  selector: 'bonus-details-modal',
  templateUrl: './bonus-details-modal.component.html',
  styleUrls: ['./bonus-details-modal.component.scss']
})
export class BonusDetailsModalComponent  implements OnInit {
  

  @Input() bonusId!: number;

  public bonus!: Bonus;
  public fileUrl: string = '';


  constructor( private bonusesService: BonusesService,
               private modalService: ModalService ) {}

  ngOnInit(): void {
    this.bonusesService.getById(this.bonusId)
      .subscribe( resp => {
        this.bonus = resp.bonus;
        this.fileUrl = `${environment.apiUrl}/uploads/docs/bonuses/${this.bonus.file}`
      })
  }


  closeModal() {
    this.modalService.closeModal();
  }



}
