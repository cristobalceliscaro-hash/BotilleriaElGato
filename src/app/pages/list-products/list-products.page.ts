import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './list-products.page.html',
  styleUrls: ['./list-products.page.scss'],
})
export class ListProductsPage implements OnInit {

  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  // También recargar al entrar nuevamente a la vista
  ionViewWillEnter() {
    this.loadProducts();
  }

  loadProducts() {
    this.products = this.productService.getProducts();
  }

  goToAddProduct() {
    this.router.navigate(['/add-product']);
  }

  goToEditProduct(id: number) {
    this.router.navigate(['/edit-product', id]);
  }

  async deleteProduct(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Seguro que deseas eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.productService.deleteProduct(id);
            this.loadProducts(); // recargar lista
          }
        }
      ]
    });

    await alert.present();
  }
}