import { Component, OnInit } from '@angular/core';
import { WorkTool } from '../../interfaces';
import { WorkToolsService } from '../../services/work-tools.service';

@Component({
  selector: 'work-tools-general-list',
  templateUrl: './work-tools-general-list.component.html',
  styleUrls: ['./work-tools-general-list.component.scss']
})
export class WorkToolsGeneralListComponent implements OnInit {

  public workTools: WorkTool[] = [];
  public isLoading: boolean = false;
  public totalResults: number = 0;
  public currentPage: number = 1;
  public limit: number = 20;
  public isSuggestions: boolean = false;
  public querySearch: string = '';

  constructor(private workToolsService: WorkToolsService) {}

  ngOnInit(): void {
    this.getWorkTools();
  }

  getWorkTools(): void {
    this.isLoading = true;
    this.workToolsService.getAll(
      this.currentPage, 
      this.limit
    ).subscribe({
      next: (resp: any) => {
        this.workTools = resp.workTools;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  searchWorkTools(): void {
    this.isLoading = true;
    this.workToolsService.search(
      this.currentPage, 
      this.limit, 
      this.querySearch
    ).subscribe({
      next: (resp: any) => {
        this.workTools = resp.workTools;
        this.totalResults = resp.totalResults;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  search(query: string): void {
    this.currentPage = 1;
    if (query.trim().length === 0) {
      this.querySearch = '';
      this.getWorkTools();
      return;
    }
    this.querySearch = query.trim();
    this.searchWorkTools();
  }

  changePage(currentPage: number): void {
    this.currentPage = currentPage;
    if (this.querySearch && this.querySearch.trim().length > 0) {
      this.searchWorkTools();
    } else {
      this.getWorkTools();
    }
  }
}