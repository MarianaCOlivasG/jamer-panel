import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';

@Component({
  selector: 'signature',
  templateUrl: './signature.component.html',
})
export class SignatureComponent implements AfterViewInit {

  @ViewChild('signaturePad')
  public signaturePad!: SignaturePadComponent;

  @Output() signatureEvent = new EventEmitter<{ signature: string; rating: number }>();

  public signaturePadOptions: NgSignaturePadOptions = {
    maxWidth: 1.5,
    minWidth: 1.5,
    dotSize: 1.5,
    velocityFilterWeight: 1.7,
    throttle: 16,
    canvasWidth: 500,
    canvasHeight: 200,
    backgroundColor: '#fff',
  };

  public signature: string = '';
  public hasSaved: boolean= false;

  ngAfterViewInit() {
    this.signaturePad.clear();
  }

  drawComplete(_event: MouseEvent | Touch) {
    this.signature = this.signaturePad.toDataURL();
  }

  drawStart(_event: MouseEvent | Touch) {
    // intentionally left blank
  }

  clear(): void {
    this.signaturePad.clear();
    this.signature = '';
  }

  confirm() {
    if (this.signature === '') return;
    this.signatureEvent.emit({ signature: this.signature, rating: 0 });
    this.hasSaved = true;

  }
}