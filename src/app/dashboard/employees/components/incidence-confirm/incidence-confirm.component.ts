import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Incidence } from '../../interfaces';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/services/auth.service';
import { IncidencesService } from '../../services/incidences.service';
import { environment } from 'src/environments/environment.development';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'incidence-confirm',
  templateUrl: './incidence-confirm.component.html',
  styleUrls: ['./incidence-confirm.component.scss']
})
export class IncidenceConfirmComponent implements OnInit {

  @Input() incidenceSelected!: Incidence;
  @Output() newIncidenceConfirm = new EventEmitter<null>();
  @Output() markAsRead = new EventEmitter<number>();


  public isLoading: boolean = false;
  public fileUrl: string = '';

  constructor( private modalService: ModalService,
               private authService: AuthService,
               private incidencesService: IncidencesService,
               private sockerRouteService: SocketsRouteService
               ) { }
  
  ngOnInit(): void {

    this.fileUrl = `${environment.apiUrl}/uploads/docs/incidences/${this.incidenceSelected?.file}`
    this.sockerRouteService.markAsReadIncidence( this.incidenceSelected.id )
   
    if ( this.incidenceSelected.isRead ) return;

 
    this.markAsRead.emit(this.incidenceSelected.id);
  }

  closeModal() {
    this.modalService.closeModal();
  }



  async signatureEvent( signature: any ) {
    this.isLoading = true;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se notificará al administrador la firma de tu incidencia.`,
      confirmButtonText: `¡Si, guardar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

   
    this.incidencesService.confirmById( this.authService.user.uid, this.incidenceSelected.id, { signature })
      .subscribe({
        next: (resp: any) => {
          
    this.sockerRouteService.markAsConfirmIncidence( this.incidenceSelected.id );
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });


          this.newIncidenceConfirm.emit();
        },
        error: (error: any) => {
          Swal.fire({
            text: error.error.message,
            icon: 'error',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

          this.isLoading = false;

        }
      })

  }
  
  
}
