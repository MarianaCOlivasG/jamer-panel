import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Bonus } from '../../interfaces';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment.development';
import { BonusesService } from '../../services/bonuses.service';
import { SocketsRouteService } from 'src/app/sockets/sockets-route.service';

@Component({
  selector: 'bonus-confirm',
  templateUrl: './bonus-confirm.component.html',
  styleUrls: ['./bonus-confirm.component.scss']
})
export class BonusConfirmComponent implements OnInit {

  @Input() bonusSelected!: Bonus;
  @Output() newBonusConfirm = new EventEmitter<null>();
  @Output() markAsRead = new EventEmitter<number>();


  public isLoading: boolean = false;
  public fileUrl: string = '';

  constructor( private modalService: ModalService,
               private authService: AuthService,
               private bonusesService: BonusesService,
               private sockerRouteService: SocketsRouteService
               ) { }
  
  ngOnInit(): void {

    this.fileUrl = `${environment.apiUrl}/uploads/docs/bonuses/${this.bonusSelected?.file}`

    if ( this.bonusSelected.isRead ) return;

    this.sockerRouteService.markAsReadBonus( this.bonusSelected.id ).subscribe({
      next: () => {
        this.markAsRead.emit(this.bonusSelected.id);
        console.log('Bonus marked as read successfully');
      },
      error: (error) => {
        console.error('Error marking bonus as read:', error);
      }
    });
  }

  closeModal() {
    this.modalService.closeModal();
  }



  async signatureEvent( signature: any ) {

    this.isLoading = true;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se notificará al administrador la firma de tu bono.`,
      confirmButtonText: `¡Si, guardar!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

   
    this.bonusesService.confirmById( this.authService.user.uid, this.bonusSelected.id, { signature })
      .subscribe({
        next: (resp: any) => {
          
        this.sockerRouteService.markAsConfirmBonus( this.bonusSelected.id );
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });

          this.newBonusConfirm.emit();
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
