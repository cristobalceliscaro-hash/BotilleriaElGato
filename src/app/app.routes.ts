import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { CreateProductPage } from './pages/create-product/create-product.page';
import { ListProductsPage } from './pages/list-products/list-products.page';
import { EditProductPage } from './pages/edit-product/edit-product.page';
import { SalesPage } from './pages/sales/sales.page';
import { SalesHistoryPage } from './pages/sales-history/sales-history.page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'list-products', component: ListProductsPage },
  { path: 'create-product', component: CreateProductPage },
  { path: 'edit-product/:codigo', component: EditProductPage },
  { path: 'sales', component: SalesPage },
  { path: 'sales-history', component: SalesHistoryPage }
];
