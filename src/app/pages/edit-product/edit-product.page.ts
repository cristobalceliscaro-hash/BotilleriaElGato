import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditProductPage implements OnInit {

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
    private route: ActivatedRoute,
    private productService: ProductService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');

    if (codigo) {
      const prod = this.productService.getByCodigo(codigo);
      if (prod) {
        this.product = { ...prod };
      } else {
        console.warn('Producto no encontrado con el código:', codigo);
      }
    }
  }

  async takePhoto() {
    try {
      const img = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        quality: 80,
        source: CameraSource.Camera
      });

      if (img?.dataUrl) {
        this.product.foto = img.dataUrl;
      }

    } catch (err) {
      console.log('No se tomó foto', err);
    }
  }

  async pickFromGallery() {
    try {
      const img = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        quality: 80,
        source: CameraSource.Photos
      });

      if (img?.dataUrl) {
        this.product.foto = img.dataUrl;
      }

    } catch (err) {
      console.log('No se seleccionó foto', err);
    }
  }

  // Validaciones
  isValid(): boolean {
    if (!/^\d{1,13}$/.test(this.product.codigo)) return false;
    if (!this.product.nombre || this.product.nombre.length > 20) return false;
    if (!/^\d{1,5}$/.test(this.product.precio)) return false;
    if (this.product.descripcion.length > 100) return false;
    if (!/^\d{1,3}$/.test(this.product.ml)) return false;
    if (!this.product.categoria) return false;
    return true;
  }

  async saveChanges() {
    if (!this.isValid()) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Revisa que los campos estén correctos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.productService.update(this.product);

    const done = await this.alertCtrl.create({
      header: 'Actualizado',
      message: 'Producto actualizado correctamente.',
      buttons: ['OK']
    });

    await done.present();
    this.router.navigateByUrl('/list-products');
  }

  async deleteProduct() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar',
      message: '¿Seguro que deseas eliminar este producto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => {
            this.productService.delete(this.product.codigo);
            this.router.navigateByUrl('/list-products');
          }
        }
      ]
    });

    await alert.present();
  }
}