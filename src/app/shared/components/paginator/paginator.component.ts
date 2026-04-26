import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'paginator',
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {

  @Input() totalResults: number = 0;
  @Input() currentPage: number = 0;
  @Input() limit: number = 0;

  @Output() chageCurrentPage: EventEmitter<number> = new EventEmitter();


  public totalPages: number = 0;
  public lastPage: number = 0;
  public pages: number[] = [];


  constructor() { }


  ngOnInit(): void {
    
      this.totalPages = Math.trunc( this.totalResults / this.limit )
      if ( (this.totalResults % this.limit) != 0 ) {
        this.totalPages = this.totalPages + 1;
      }
      this.lastPage = this.totalPages;
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i)
      }
  }


  changePage( page: number ):void {
    this.currentPage = page;
    this.chageCurrentPage.emit( page );
  }

}
