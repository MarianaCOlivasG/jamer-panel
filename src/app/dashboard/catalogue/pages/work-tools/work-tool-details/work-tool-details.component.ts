import { Component } from '@angular/core';
import { WorkTool } from '../../../interfaces';
import { environment } from 'src/environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkToolsService } from '../../../services/work-tools.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-work-tool-details',
  templateUrl: './work-tool-details.component.html',
  styleUrls: ['./work-tool-details.component.scss']
})
export class WorkToolDetailsComponent {

  
  public workTool!: WorkTool; 
  public workToolSelected!: WorkTool;

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;

  public modalSelected: 'image' | 'files' | '' = 'files';



  constructor( private activatedRoute: ActivatedRoute,
               private workToolsService: WorkToolsService,
               public modalService: ModalService,
               public authService: AuthService,
               private localStorageService: LocalStorageService,
               private router: Router,
               
               ){}
               public edit:any;
  ngOnInit(): void {
    this.getWorkTool();
    
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "store")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.edit =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
  }

  getWorkTool() {
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.workToolsService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.workTool = resp.workTool;
        this.isLoading = false;
      });
  }


  openModal( workTool: WorkTool, modalSelected: 'image' | 'files'  ) {
    if ( this.authService.user.role.key != 'admin' ) return;
    this.workToolSelected = workTool;
    this.modalSelected = modalSelected;
    this.modalService.openModal();
  }

  closeModal() {
    this.modalSelected = '';
  }


  changeImage( newPicture: string) {
    this.workTool.image = newPicture;
  }


}
 