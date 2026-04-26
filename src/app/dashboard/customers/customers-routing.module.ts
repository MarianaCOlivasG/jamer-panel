import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './pages/customers/customers.component';
import { CustomerDetailsComponent } from './pages/customer-details/customer-details.component';
import { CustomerFormComponent } from './pages/customer-form/customer-form.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { BudgetDetailsComponent } from './pages/budget-details/budget-details.component';
import { BudgetFormComponent } from './pages/budget-form/budget-form.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { ContractFormComponent } from './pages/contract-form/contract-form.component';
import { ContractDetailsComponent } from './pages/contract-details/contract-details.component';
import { WorkTypesComponent } from './pages/work-types/work-types.component';
import { HtmlDescriptionsGeneralComponent } from './pages/html-descriptions-general/html-descriptions-general.component';
import { ExpiringContractsComponent } from './pages/expiring-contracts/expiring-contracts.component';
import { CobranzaComponent } from './pages/cobranza/cobranza.component';
import { CobranzaSalesComponent } from './pages/cobranza-sales/cobranza-sales.component';
import { XCobrarComponent } from './pages/x-cobrar/x-cobrar.component';
import { ContractsSalesComponent } from './pages/contracts-sales/contracts-sales.component';
import { ContractSaleDetailsComponent } from './pages/contract-sale-details/contract-sale-details.component';

const routes: Routes = [
  {
    path: '',
    component: CustomersComponent
  },
  {
    path: 'details/:id',
    component: CustomerDetailsComponent
  },
  {
    path: 'new',
    component: CustomerFormComponent
  },
  {
    path: 'edit/:id',
    component: CustomerFormComponent
  },
  {
    path: 'budgets',
    component: BudgetsComponent
  },
  {
    path: 'budgets/details/:id',
    component: BudgetDetailsComponent
  },
  {
    path: 'budgets/new',
    component: BudgetFormComponent
  },
  {
    path: 'budgets/edit/:id',
    component: BudgetFormComponent
  },
  {
    path: 'contracts',
    component: ContractsComponent
  },
  
  {
    path: 'sales',
    component: ContractsSalesComponent
  },
  {
    path: 'sales/details/:id',
    component: ContractSaleDetailsComponent
  },
  {
    path: 'expiring-contracts',
    component: ExpiringContractsComponent
  },
  {
    path: 'contracts/details/:id',
    component: ContractDetailsComponent
  },
  {
    path: 'contracts/new',
    component: ContractFormComponent
  },
  {
    path: 'contracts/edit/:id',
    component: ContractFormComponent
  },
  {
    path: 'work-types',
    component: WorkTypesComponent
  },
  {
    path: 'payments/:documentType',
    component: CobranzaComponent
  },
  {
    path: 'payments-sales/:documentType',
    component: CobranzaSalesComponent
  },
  {
    path: 'descriptions',
    component: HtmlDescriptionsGeneralComponent
  },
  {
    path: 'x-cobrar',
    component: XCobrarComponent
  },
  {
      path: '**',
      redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
