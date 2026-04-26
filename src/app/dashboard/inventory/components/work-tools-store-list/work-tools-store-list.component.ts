import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from 'src/app/shared/services/modal.service';
import { WorkTool } from 'src/app/dashboard/catalogue/interfaces';
import { WorkToolsService } from 'src/app/dashboard/catalogue/services/work-tools.service';
import { StoresService } from 'src/app/dashboard/catalogue/services/stores.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'work-tools-store-list',
  templateUrl: './work-tools-store-list.component.html',
  styleUrls: ['./work-tools-store-list.component.scss']
})
export class WorkToolsStoreListComponent implements OnInit {


  @Output() onRemoveEvent = new EventEmitter<number>();


  public storeId: number = 0; 

  public workTools: WorkTool[] = [];

  public isLoading: boolean = false;

  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';

  public isSaving: boolean = false;


  constructor(  public authService: AuthService,
              private workToolsService: WorkToolsService,
              public modalService: ModalService,
              public storesService: StoresService,
              private activatedRoute: ActivatedRoute ){}

  ngOnInit(): void {

    this.activatedRoute.params.subscribe( ({id}) => {
      this.storeId = id;
    });

    this.getWorkTools();

  }

  getWorkTools() {
    this.isLoading = true;
    this.workToolsService.getAllByStoreId(
      this.storeId,
      this.currentPage, 
      this.limit, 
    )
      .subscribe({
        next: (resp: any) => {
          this.workTools = resp.workTools;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }


  searchWorkTools() {
    this.isLoading = true;
    this.workToolsService.searchByStoreId(
      this.storeId,
      this.currentPage, 
      this.limit, 
      this.querySearch
    )
      .subscribe({
        next: (resp: any) => {
          this.workTools = resp.workTools;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  search( query:string ):void {

    this.currentPage = 1;

    if ( query.length == 0 ) {
      this.isSuggestions = false;
      this.querySearch = '';
      this.getWorkTools();
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchWorkTools()

  }

  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getWorkTools();
      } else {
        this.searchWorkTools();
      }
  }


  
  async removeToStore( workToolStoreId: number ) {

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Eliminará la herramienta/equipo de el almacén`,
      confirmButtonText: `¡Si, remover!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    this.isSaving = true;

    this.storesService.removeWorkToolsToStore( workToolStoreId )
      .subscribe({
        next: (resp) => {
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
          this.onRemoveSuccess();
          this.onRemoveEvent.emit( workToolStoreId );
        },
        error: (error) => {
          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
          this.isSaving = false;
        }
      })
  }


  onRemoveSuccess() {
    this.currentPage = 1;
    this.isSuggestions = false;
    this.getWorkTools();
  }


}
