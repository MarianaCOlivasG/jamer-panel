import { AddProductStoreComponent } from './components/add-product-store/add-product-store.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { BusinessFamiliesComponent } from './components/business-families/business-families.component';
import { BusinessFamilyDetailsComponent } from './pages/business-families/business-family-details/business-family-details.component';
import { BusinessFamilyFormModalComponent } from './components/business-families/business-family-form-modal/business-family-form-modal.component';
import { BusinessLineDetailsComponent } from './pages/business-lines/business-line-details/business-line-details.component';
import { BusinessLineFormComponent } from './pages/business-lines/business-line-form/business-line-form.component';
import { BusinessLinesComponent } from './pages/business-lines/business-lines.component';
import { CatalogueRoutingModule } from './catalogue-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HtmlDecoderPipe } from './pipes/html-decoder.pipe';
import { InventoryModule } from '../inventory/inventory.module';
import { KardexComponent } from './pages/kardex/kardex.component';
import { NgModule } from '@angular/core';
import { ProductDetailsComponent } from './pages/products/product-details/product-details.component';
import { ProductFilesModalComponent } from './components/product-files-modal/product-files-modal.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { ProductModalComponent } from './components/product-modal/product-modal.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductsListComponent } from './components/business-families/products-list/products-list.component';
import { ProductsStoreListComponent } from './components/products-store-list/products-store-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StoreDetailsComponent } from './pages/stores/store-details/store-details.component';
import { StoreFormComponent } from './pages/stores/store-form/store-form.component';
import { StoresComponent } from './pages/stores/stores.component';
import { WorkToolDetailsComponent } from './pages/work-tools/work-tool-details/work-tool-details.component';
import { WorkToolFormComponent } from './pages/work-tools/work-tool-form/work-tool-form.component';
import { WorkToolModalComponent } from './components/work-tool-modal/work-tool-modal.component';
import { WorkToolsComponent } from './pages/work-tools/work-tools.component';
import { MaintenanceComponent } from './pages/work-tools/maintenance/maintenance.component';
import { MaintenanceModalComponent } from './components/maintenance-modal/maintenance-modal.component';
import { HtmlDescriptionsProductComponent } from './components/html-descriptions-product/html-descriptions-product.component';
import { HtmlDescriptionsModalProductComponent } from './components/html-descriptions-modal-product/html-descriptions-modal-product.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { VehicleDetailsComponent } from './pages/vehicles/vehicle-details/vehicle-details.component';
import { VehicleFormComponent } from './pages/vehicles/vehicle-form/vehicle-form.component';
import { MaintenanceVehicleComponent } from './pages/vehicles/maintenance/maintenance.component';
import { VehicleModalComponent } from './components/vehicle-modal/vehicle-modal.component';
import { MaintenanceVehicleModalComponent } from './components/maintenance-vehicle-modal/maintenance-vehicle-modal.component';
import { AssignToModalComponent } from './components/assign-to-modal/assign-to-modal.component';
import { ProductsGeneralListComponent } from './components/products-store-list/products-general-list/products-general-list.component';
import { WorkToolsGeneralListComponent } from './components/work-tool-general-list/work-tools-general-list.component';
import { StoreProductsComponent } from './components/general-storage/store-products.component';
import { ProductsByStoreTableComponent } from './components/general-storage/products-by-store-table.component';


@NgModule({
  declarations: [
    AddProductStoreComponent,
    BusinessFamiliesComponent,
    BusinessFamilyDetailsComponent,
    BusinessFamilyFormModalComponent,
    BusinessLineDetailsComponent,
    BusinessLineFormComponent,
    BusinessLinesComponent,
    HtmlDecoderPipe,
    KardexComponent,
    ProductDetailsComponent,
    ProductFilesModalComponent,
    ProductFormComponent,
    ProductModalComponent,
    ProductsComponent,
    ProductsListComponent,
    ProductsStoreListComponent,
    StoreDetailsComponent,
    StoreFormComponent,
    StoresComponent,
    WorkToolDetailsComponent,
    WorkToolFormComponent,
    WorkToolModalComponent,
    WorkToolsComponent,
    MaintenanceComponent,
    MaintenanceModalComponent,
    MaintenanceVehicleModalComponent,
    MaintenanceVehicleComponent,
    HtmlDescriptionsProductComponent,
    HtmlDescriptionsModalProductComponent,
    VehiclesComponent,
    VehicleDetailsComponent,
    VehicleFormComponent,
    VehicleModalComponent,
    AssignToModalComponent,
    ProductsGeneralListComponent,
    WorkToolsGeneralListComponent,
    StoreProductsComponent,
    ProductsByStoreTableComponent
  ],
  imports: [
    CommonModule,
    CatalogueRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMultiSelectModule,
    InventoryModule,
    AngularEditorModule

  ]
})
export class CatalogueModule { }
