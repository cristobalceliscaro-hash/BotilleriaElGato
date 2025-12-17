import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './list-products.page.html',
  styleUrls: ['./list-products.page.scss'],
})
export class ListProductsPage implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory: Product['categoria'] | 'Todos' = 'Todos';
  categories: (Product['categoria'] | 'Todos')[] = ['Todos', 'Cervezas', 'Bebidas o Aguas', 'Jugos', 'Vinos', 'Destilados'];

  constructor(
    private productService: ProductService,
    private alertController: AlertController,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar si hay un parámetro de categoría en la URL
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.selectedCategory = params['categoria'];
      }
      this.loadProducts();
    });
  }

  ionViewWillEnter() {
    this.loadProducts();
  }

  loadProducts() {
    this.products = this.productService.getAll();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = this.searchTerm === '' || 
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.codigo.includes(this.searchTerm);
      
      const matchesCategory = this.selectedCategory === 'Todos' || p.categoria === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onCategoryChange() {
    this.applyFilters();
  }

  goToAddProduct() {
    this.router.navigate(['/create-product']);
  }

  goToEditProduct(codigo: string) {
    this.router.navigate(['/edit-product', codigo]);
  }

  async deleteProduct(codigo: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar Producto',
      message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.productService.deleteProduct(codigo);
            this.loadProducts();
            
            this.alertController.create({
              header: 'Eliminado',
              message: 'Producto eliminado correctamente.',
              buttons: ['OK']
            }).then(alert => alert.present());
          }
        }
      ]
    });

    await alert.present();
  }

  getTotalProductos(): number {
    return this.filteredProducts.length;
  }

  getValorTotalInventario(): number {
    return this.filteredProducts.reduce((total, p) => {
      const precio = parseFloat(p.precio) || 0;
      return total + precio;
    }, 0);
  }

  getProductsByCategory(category: Product['categoria']): number {
    return this.products.filter(p => p.categoria === category).length;
  }

  // Métodos para la tabla de resumen por categoría
  getTotalUnidadesPorCategoria(categoria: Product['categoria']): number {
    return this.products
      .filter(p => p.categoria === categoria)
      .reduce((total, p) => total + (p.cantidadUnidades || 0), 0);
  }

  getTotalPacksPorCategoria(categoria: Product['categoria']): number {
    return this.products
      .filter(p => p.categoria === categoria)
      .reduce((total, p) => {
        const packs = Math.floor(p.cantidadUnidades / p.unidadesPorPack);
        return total + packs;
      }, 0);
  }

  getValorInventarioPorCategoria(categoria: Product['categoria']): number {
    return this.products
      .filter(p => p.categoria === categoria)
      .reduce((total, p) => {
        const precioVenta = parseFloat(p.precioVenta || p.precio) || 0;
        return total + (precioVenta * (p.cantidadUnidades || 0));
      }, 0);
  }

  getProductosPorCategoria(categoria: Product['categoria']): Product[] {
    return this.products.filter(p => p.categoria === categoria);
  }

  getValorTotalInventarioPorMargen(): number {
    return this.products.reduce((total, p) => {
      const precioVenta = parseFloat(p.precioVenta || p.precio) || 0;
      return total + (precioVenta * (p.cantidadUnidades || 0));
    }, 0);
  }

  getTotalUnidadesGlobal(): number {
    return this.products.reduce((sum, p) => sum + (p.cantidadUnidades || 0), 0);
  }

  getTotalPacksGlobal(): number {
    return this.products.reduce((sum, p) => {
      const packsCalculados = Math.floor(p.cantidadUnidades / p.unidadesPorPack);
      return sum + packsCalculados;
    }, 0);
  }
}