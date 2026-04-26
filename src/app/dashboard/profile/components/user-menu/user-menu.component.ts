import { Component } from '@angular/core';

@Component({
  selector: 'user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {

  public totals: any = { 
    incidences: 0,
    bonuses: 0 ,
  };

  getTotals( total: number, entity: string ) {
    this.totals[entity] = total;
  }

}
