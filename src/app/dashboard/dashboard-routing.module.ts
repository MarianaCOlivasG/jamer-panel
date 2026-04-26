import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'employees',
        loadChildren: () => import('./employees/employees.module').then(m => m.EmployeesModule),
      },
      {
        path: 'customers',
        loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule),
      },
      {
        path: 'leads',
        loadChildren: () => import('./leads/leads.module').then(m => m.LeadsModule),
      },
      {
        path: 'calendar',
        loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule),
      },
      {
        path: 'suppliers',
        loadChildren: () => import('./suppliers/suppliers.module').then(m => m.SuppliersModule),
      },
      {
        path: 'catalogue',
        loadChildren: () => import('./catalogue/catalogue.module').then(m => m.CatalogueModule),
      },
      {
        path: 'inventory',
        loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule),
      },
      {
        path: 'work-orders',
        loadChildren: () => import('./work-orders/work-orders.module').then(m => m.WorkOrdersModule),
      },
      {
        path: 'purchase-orders',
        loadChildren: () => import('./purchase-orders/purchase-orders.module').then(m => m.PurchaseOrdersModule),
      },
      {
        path: 'purchases',
        loadChildren: () => import('./purchases/purchases.module').then(m => m.PurchasesModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
      },
      {
        path: 'cash-register',
        loadChildren: () => import('./cash-register/cash-register.module').then(m => m.CashRegisterModule),
      },
      {
        path: 'info',
        loadChildren: () => import('./info/info.module').then(m => m.InfoModule),
      },
      {
        path: 'sales',
        loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule),
      },
      {
          path: '**',
          redirectTo: 'employees'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
