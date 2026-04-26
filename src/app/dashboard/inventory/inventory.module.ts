import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { WorkToolsListComponent } from './components/work-tools-list/work-tools-list.component';
import { WorkToolsStoreListComponent } from './components/work-tools-store-list/work-tools-store-list.component';


@NgModule({
  declarations: [
    InventoryComponent,
    ProductsListComponent,
    WorkToolsListComponent,
    WorkToolsStoreListComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule,
    FormsModule,
  ],
  exports: [
    WorkToolsStoreListComponent
  ]
})
export class InventoryModule { }
