import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersRoutingModule } from './customers-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerFormComponent } from './pages/customer-form/customer-form.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { CustomerDetailsComponent } from './pages/customer-details/customer-details.component';
import { AddressesTableComponent } from './components/addresses-table/addresses-table.component';
import { AddressModalComponent } from './components/address-modal/address-modal.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { BudgetsTableComponent } from './components/budgets-table/budgets-table.component';
import { BudgetDetailsComponent } from './pages/budget-details/budget-details.component';
import { BudgetFormComponent } from './pages/budget-form/budget-form.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { HtmlDescriptionModalComponent } from './components/html-description-modal/html-description-modal.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { SelectBudgetModalComponent } from './components/contracts/select-budget-modal/select-budget-modal.component';
import { ContractFormComponent } from './pages/contract-form/contract-form.component';
import { ContractDetailsComponent } from './pages/contract-details/contract-details.component';
import { ContractsTableComponent } from './components/contracts/contracts-table/contracts-table.component';
import { WorkTypesComponent } from './pages/work-types/work-types.component';
import { WorkTypeModalComponent } from './components/work-type-modal/work-type-modal.component';
import { HtmlDescriptionsGeneralComponent } from './pages/html-descriptions-general/html-descriptions-general.component';
import { HtmlDescriptionGeneralFormComponent } from './components/html-description-general-form/html-description-general-form.component';
import { ExpiringContractsComponent } from './pages/expiring-contracts/expiring-contracts.component';
import { AgendarModalComponent } from './components/agendar-modal/agendar-modal.component';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';
import { ContractRenewModalComponent } from './pages/contract-renew-modal/contract-renew-modal.component';
import { ContactModalComponent } from './components/contact-modal/contact-modal.component';
import { CobranzaComponent } from './pages/cobranza/cobranza.component';
import { CobranzaModalComponent } from './pages/cobranza-modal/cobranza-modal.component';
import { CobranzaSalesComponent } from './pages/cobranza-sales/cobranza-sales.component';
import { CobranzaSaleModalComponent } from './components/cobranza-sale-modal/cobranza-sale-modal.component';
import { FacturasModalComponent } from './components/facturas-modal/facturas-modal.component';
import { EmailsFacturasModalComponent } from './components/emails-facturas-modal/emails-facturas-modal.component';
import { TagInputModule } from 'ngx-chips';
import { XCobrarComponent } from './pages/x-cobrar/x-cobrar.component';
import { ContractsSalesComponent } from './pages/contracts-sales/contracts-sales.component';
import { ContractSaleDetailsComponent } from './pages/contract-sale-details/contract-sale-details.component';
import { SelectContractModalComponent } from './pages/budgets/select-contract-modal/select-contract-modal.component';

import { WorkordersTableComponent } from './components/customer-workorders-table/workorders-table.component';

import { ContactsTableComponent } from './components/contacts-table/contacts-table.component';
import { EditCobranzaModalComponent } from './components/edit-cobranza-modal/edit-cobranza-modal.component';



@NgModule({
  declarations: [
    WorkordersTableComponent,
    AddressesTableComponent,
    AddressModalComponent,
    BudgetDetailsComponent,
    BudgetFormComponent,
    BudgetsComponent,
    BudgetsTableComponent,
    ContractDetailsComponent,
    ContractFormComponent,
    ContractsComponent,
    ContractsSalesComponent,
    ContractsTableComponent,
    CustomerDetailsComponent,
    CustomerFormComponent,
    CustomersComponent,
    ExpiringContractsComponent,
    HtmlDescriptionGeneralFormComponent,
    HtmlDescriptionModalComponent,
    HtmlDescriptionsGeneralComponent,
    SelectBudgetModalComponent,
    WorkTypeModalComponent,
    WorkTypesComponent,
    AgendarModalComponent,
    PaymentModalComponent,
    ContractRenewModalComponent,
    ContactModalComponent,
    CobranzaComponent,
    CobranzaModalComponent,
    CobranzaSalesComponent,
    CobranzaSaleModalComponent,
    FacturasModalComponent,
    EmailsFacturasModalComponent,
    XCobrarComponent,
    ContractSaleDetailsComponent,
    SelectContractModalComponent,
    ContactsTableComponent,
    EditCobranzaModalComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMultiSelectModule,
    AngularEditorModule,
    TagInputModule,
  ],
  exports: [
    HtmlDescriptionModalComponent
  ]
})
export class CustomersModule { }
