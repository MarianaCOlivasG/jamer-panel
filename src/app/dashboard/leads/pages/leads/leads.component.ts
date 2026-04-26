import { Component } from '@angular/core';
import { Lead } from '../../interfaces';
import { LeadsService } from '../../services/leads.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import Swal from 'sweetalert2';
import { CustomersService } from 'src/app/dashboard/customers/services/customers.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent {

  public leads: Lead[] = [];
  public leadSelected!: Lead;
  public isLoading: boolean = true;
  
  public totalResults: number = 0; 
  public currentPage: number = 1;
  public limit: number = 20;

  public isSuggestions: boolean = false;
  public querySearch: string = '';


  constructor( private leadsService: LeadsService,
               public modalService: ModalService,
               public customerService: CustomersService,
               private router: Router,
               private localStorageService: LocalStorageService,
               ) { }
               public create: any;
               public add:any;
               public contact:any;
  ngOnInit(): void {
    this.getAll( this.currentPage, this.limit );

    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  

    const permissions = (storedPermissions?.find((p)=> p.page == "leads")?.permissions );
    ((permissions as number >> 0 ) % 2 == 1)? true :  this.router.navigate(['/calendar/my-calendar']);
     this.create =  ((permissions as number >> 1 ) % 2 == 1)? true :false; 
     this.add =  ((permissions as number >> 2 ) % 2 == 1)? true :false; 
     this.contact =  ((permissions as number >> 3 ) % 2 == 1)? true :false;
  }

  getAll( page: number, limit: number) {
    this.isLoading = true;
    this.leadsService.getAll(page, limit)
      .subscribe({
        next: (resp: any) => {
          this.leads = resp.leads;
          this.totalResults = resp.totalResults;
          this.isLoading = false;
        },
    })
  }

  searchLeads( page: number, limit: number, queryString: string) {
    this.isLoading = true;
    this.leadsService.search(page, limit, queryString)
      .subscribe({
        next: (resp: any) => {
          this.leads = resp.leads;
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
      this.getAll( this.currentPage, this.limit )
      return;
    }

    if ( query.trim().length == 0 ) {
      this.isSuggestions = false;
      return;
    };

    this.isSuggestions = true;
    this.querySearch = query.trim();
    this.searchLeads( this.currentPage, this.limit, this.querySearch )

  }


  changePage( currentPage: number ) {
      this.currentPage = currentPage;
      if ( !this.isSuggestions ) {
        this.getAll( this.currentPage, this.limit )
      } else {
        this.searchLeads( this.currentPage, this.limit, this.querySearch )
      }
  }


  showMoreDetails( lead: Lead ) {
    this.leadSelected = lead;
    this.modalService.openModal();
  }

  async convertirToCustomer( lead: Lead ) {

    this.customerService.setLeadTemp({ name: lead.fullName, email: lead.email, phone: lead.phone });
    this.router.navigateByUrl('/customers/new');

    return;

    const { isConfirmed } = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se añadira un cliente con los datos de este lead`,
      confirmButtonText: `¡Si, convertir!`,
      confirmButtonColor: '#43B02A',
      showCancelButton: true,
      cancelButtonText: '¡No, cancelar!',
      cancelButtonColor: '#f23e3e',
      allowOutsideClick: false
    })

    if ( !isConfirmed ) return;

    const data = {
      name: lead.fullName,
      cellPhone: lead.phone,
      email: lead.email,
      typeId: 1
    }

    this.leadsService.converToCustomer( lead.id, data )
      .subscribe({
        next: (resp) => {
          lead.isCustomer = true;
          Swal.fire({
            text: resp.message,
            icon: 'success',
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2500,
            showConfirmButton: false
          });
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
        }
      })
  }
  
}
