import { Component } from '@angular/core';
import { Budget } from '../../interfaces/budget.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetsService } from '../../services/budgets.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { switchMap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Swal from 'sweetalert2';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Contract } from '../../interfaces/contract.interface';
import { ContractsService } from '../../services/contracts.service';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-sale-details.component.html',
  styleUrls: ['./contract-sale-details.component.scss']
})
export class ContractSaleDetailsComponent {

  
  public contract!: Contract; 

  public isLoading: boolean = true;

  public fileUrl: string = environment.apiUrl;


  constructor( private activatedRoute: ActivatedRoute,
               private contractsService: ContractsService,
               public authService: AuthService,
               public modalService: ModalService,
               private localStorageService: LocalStorageService,
               private router: Router,
               ){}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.contractsService.getById(id) )
      )
      .subscribe( (resp: any) =>{
        this.contract = resp.contract;
        console.log(this.contract)
        
        this.isLoading = false;
        const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

        const permissions = (storedPermissions?.find((p)=> p.page == "sale")?.permissions );
        ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
      });
  }

  openModal() {
    this.modalService.openModal();
  }


}
