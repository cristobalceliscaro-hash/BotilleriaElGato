import { Routes } from '@angular/router';
import { CreateProductPage } from './pages/create-product/create-product.page';
import { ListProductsPage } from './pages/list-products/list-products.page';
import { EditProductPage } from './pages/edit-product/edit-product.page';

export const routes: Routes = [
  { path: '', redirectTo: 'list-products', pathMatch: 'full' },
  { path: 'list-products', component: ListProductsPage },
  { path: 'create-product', component: CreateProductPage },
  { path: 'edit-product/:index', component: EditProductPage }
];
