import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  public show: boolean = false;
  public name: string = '';

  constructor() { }

  openModal() {
    this.show = true;
  }

  closeModal() {
    this.show = false;
    this.name = '';
  }

  showModal(value: boolean) {
    this.show = value;
  }

  setName( name: string ) {
    this.name = name;
  }

}
