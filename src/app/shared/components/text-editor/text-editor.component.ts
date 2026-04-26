import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent implements OnInit {

  
  @Input() title: string = '';
  @Input() htmlCurrentDescription: string = '';
  @Output() newHtmlDescription = new EventEmitter<any>();

  public htmlDescription: any;

  public editorConfig: AngularEditorConfig = {
    editable: true,
    height: '200px',
    sanitize: true
  }

  constructor( public modalService: ModalService ) {}

  ngOnInit(): void {
    if ( !this.htmlCurrentDescription ) return;
    this.htmlDescription = this.htmlCurrentDescription;
  }

  saveText() {
    this.newHtmlDescription.emit(this.htmlDescription);
    this.closeModal();
  }

  closeModal() {
    this.modalService.closeModal();
  }

}
