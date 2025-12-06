import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'crear-producto',
    loadComponent: () =>
      import('./pages/create-product/create-product.page')
        .then(m => m.CreateProductPage),
  },
  {
    path: 'listar-productos',
    loadComponent: () =>
      import('./pages/list-products/list-products.page')
        .then(m => m.ListProductsPage),
  }
];