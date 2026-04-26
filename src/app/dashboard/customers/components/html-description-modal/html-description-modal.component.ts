import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ModalService } from 'src/app/shared/services/modal.service';
import { HtmlDescriptionsService } from '../../services/html-descriptions.service';
import { HtmlDescription } from '../../interfaces/html-description.interface';

@Component({
  selector: 'html-description-modal',
  templateUrl: './html-description-modal.component.html',
  styleUrls: ['./html-description-modal.component.scss']
})
export class HtmlDescriptionModalComponent {

  
  @Input() productId: number = 0;
  @Input() title: string = '';
  @Input() htmlCurrentDescription: string = '';
  @Output() newHtmlDescription = new EventEmitter<any>();

  public htmlDescription!: string | null;
  public htmlDescSelected: number = 0;

  public editorConfig: AngularEditorConfig = {
    editable: true,
    height: '200px',
    sanitize: true,  
  }

  public htmlDescriptions: HtmlDescription[] = [];

  constructor( public modalService: ModalService,
               private htmlDescriptionsService: HtmlDescriptionsService ) {}

  ngOnInit(): void {

    this.htmlDescriptionsService.getAllByProductId( this.productId )
      .subscribe({
        next: ({htmlDescriptions}) => {
          console.log('resp')
          this.htmlDescriptions = htmlDescriptions;
        }
      })
      
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

  onChange() {
    if ( this.htmlDescSelected == 0 ) return;
    this.htmlDescription = this.htmlDescriptions.find( htmlDesc => htmlDesc.id == this.htmlDescSelected )!.htmlDescription;
  } 

}
