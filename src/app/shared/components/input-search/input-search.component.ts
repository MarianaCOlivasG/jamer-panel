import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'input-search',
  templateUrl: './input-search.component.html',
})
export class InputSearchComponent implements OnInit {

  @Output() onEnter: EventEmitter<string> = new EventEmitter();
  @Output() onDebounce: EventEmitter<string> = new EventEmitter();

  @Input() placeholder: string = 'Buscar';
 
  public debouncer: Subject<string> = new Subject();
  public query: string = '';

  constructor() { }

  ngOnInit(): void {
    this.debouncer
      .pipe(
        debounceTime(300)
      )
      .subscribe( value => {
        this.onDebounce.emit( value );
      })
  }

  search():void {
    this.onEnter.emit( this.query );
  }
  
  keyPress():void {
    this.debouncer.next(this.query);
  }


  resetValueInput() {
    this.query = '';
  }

}
