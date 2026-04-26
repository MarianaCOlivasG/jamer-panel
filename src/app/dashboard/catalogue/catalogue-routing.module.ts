import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessLinesComponent } from './pages/business-lines/business-lines.component';
import { BusinessLineDetailsComponent } from './pages/business-lines/business-line-details/business-line-details.component';
import { BusinessLineFormComponent } from './pages/business-lines/business-line-form/business-line-form.component';
import { StoresComponent } from './pages/stores/stores.component';
import { StoreDetailsComponent } from './pages/stores/store-details/store-details.component';
import { StoreFormComponent } from './pages/stores/store-form/store-form.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailsComponent } from './pages/products/product-details/product-details.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { BusinessFamilyDetailsComponent } from './pages/business-families/business-family-details/business-family-details.component';
import { WorkToolsComponent } from './pages/work-tools/work-tools.component';
import { WorkToolDetailsComponent } from './pages/work-tools/work-tool-details/work-tool-details.component';
import { WorkToolFormComponent } from './pages/work-tools/work-tool-form/work-tool-form.component';
import { KardexComponent } from './pages/kardex/kardex.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { VehicleDetailsComponent } from './pages/vehicles/vehicle-details/vehicle-details.component';
import { VehicleFormComponent } from './pages/vehicles/vehicle-form/vehicle-form.component';
import { ProductsByStoreTableComponent } from './components/general-storage/products-by-store-table.component';

const routes: Routes = [
  {
    path: 'business_lines',
    component: BusinessLinesComponent
  },
  {
    path: 'business_lines/details/:id',
    component: BusinessLineDetailsComponent
  },
  {
    path: 'business_lines/new',
    component: BusinessLineFormComponent
  },
  {
    path: 'business_lines/edit/:id',
    component: BusinessLineFormComponent
  },
  {
    path: 'business_family/details/:id',
    component: BusinessFamilyDetailsComponent
  },
  {
    path: 'stores',
    component: StoresComponent
  },
  {
    path: 'stores/details/:id',
    component: StoreDetailsComponent
  },
  {
    path: 'stores/new',
    component: StoreFormComponent
  },
  {
    path: 'storesProducts',
    component: ProductsByStoreTableComponent
  },
  {
    path: 'stores/edit/:id',
    component: StoreFormComponent
  },
  {
    path: 'products',
    component: ProductsComponent
  },
  {
    path: 'products/details/:id',
    component: ProductDetailsComponent
  },
  {
    path: 'products/new',
    component: ProductFormComponent
  },
  {
    path: 'products/edit/:id',
    component: ProductFormComponent
  },
  {
    path: 'work-tools',
    component: WorkToolsComponent
  },
  {
    path: 'work-tools/details/:id',
    component: WorkToolDetailsComponent
  },
  {
    path: 'work-tools/new',
    component: WorkToolFormComponent
  },
  {
    path: 'work-tools/edit/:id',
    component: WorkToolFormComponent
  },
  {
    path: 'vehicles',
    component: VehiclesComponent
  },
  {
    path: 'vehicles/details/:id',
    component: VehicleDetailsComponent
  },
  {
    path: 'vehicles/new',
    component: VehicleFormComponent
  },
  {
    path: 'vehicles/edit/:id',
    component: VehicleFormComponent
  },
  {
    path: 'kardex',
    component: KardexComponent
  },
  {
      path: '**',
      redirectTo: 'business_lines'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogueRoutingModule { }
