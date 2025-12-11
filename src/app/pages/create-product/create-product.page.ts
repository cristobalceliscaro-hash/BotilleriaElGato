import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  templateUrl: './create-product.page.html',
  styleUrls: ['./create-product.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateProductPage {

  product: Product = {
    codigo: '',
    nombre: '',
    precio: '',
    descripcion: '',
    ml: '',
    categoria: '',
    foto: ''
  };

  categorias = ['Cervezas', 'Bebidas o Aguas', 'Vinos', 'Destilados'];

  constructor(
    private productService: ProductService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  // --------------------------
  // MÉTODO PARA LIMPIAR NÚMEROS
  // --------------------------
  sanitizeNumber(field: 'codigo' | 'precio' | 'ml') {
    this.product[field] = this.product[field].replace(/\D/g, '');
  }

  // --------------------------
  // TOMAR FOTO
  // --------------------------
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 80
      });

      this.product.foto = image.dataUrl || '';
    } catch (err) {
      // usuario canceló
    }
  }

  // --------------------------
  // SELECCIONAR DESDE GALERÍA
  // --------------------------
  async pickFromGallery() {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 80
      });

      this.product.foto = image.dataUrl || '';
    } catch (err) {
      // usuario canceló
    }
  }

  // --------------------------
  // VALIDACIONES
  // --------------------------
  isValid(): boolean {
    if (!/^\d{1,13}$/.test(this.product.codigo)) return false;
    if (!this.product.nombre || this.product.nombre.length > 20) return false;
    if (!/^\d{1,5}$/.test(this.product.precio)) return false;
    if (this.product.descripcion.length > 100) return false;
    if (!/^\d{1,3}$/.test(this.product.ml)) return false;
    if (!this.product.categoria) return false;
    return true;
  }

  // --------------------------
  // GUARDAR PRODUCTO
  // --------------------------
  async saveProduct() {
    if (!this.isValid()) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Revisa que todos los campos estén correctos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.productService.save(this.product);

    const ok = await this.alertCtrl.create({
      header: 'Guardado',
      message: 'Producto guardado correctamente.',
      buttons: ['OK']
    });
    await ok.present();

    this.router.navigateByUrl('/list-products');
  }
}