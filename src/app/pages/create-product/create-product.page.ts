import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { ImageService } from '../../services/image.service';

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
    volumen: { cantidad: '', unidad: 'ml' },
    categoria: 'Cervezas',
    foto: '',
    unidadesPorPack: 6,
    cantidadPacks: 0,
    unidadesPersonalizadas: 0,
    cantidadUnidades: 0,
    precioCompra: '',
    margenGanancia: 30,
    precioVenta: '',
    iva: ''
  };

  categorias: Product['categoria'][] = ['Cervezas', 'Bebidas o Aguas', 'Jugos', 'Vinos', 'Destilados'];
  unidadesPorPackOptions = [6, 8, 12, 24];
  margenGananciaOptions = [11, 21, 30, 35, 40];
  isLoading = false;
  fotoCapturada = false;

  constructor(
    private productService: ProductService,
    private imageService: ImageService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 85
      });

      if (image.dataUrl) {
        await this.procesarImagen(image.dataUrl);
      }
    } catch (err) {
      console.log('Captura cancelada');
    }
  }

  async pickFromGallery() {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 85
      });

      if (image.dataUrl) {
        await this.procesarImagen(image.dataUrl);
      }
    } catch (err) {
      console.log('Selección cancelada');
    }
  }

  private async procesarImagen(dataUrl: string) {
    try {
      // Recortar y redimensionar la imagen a 400x300 (proporción 4:3)
      this.product.foto = await this.imageService.cropAndResize(dataUrl, 400, 300);
      this.fotoCapturada = true;
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo procesar la imagen. Intenta nuevamente.',
        buttons: ['Aceptar']
      });
      await alert.present();
    }
  }

  filterNumeric(field: 'codigo' | 'precio') {
    if (field === 'codigo') {
      this.product[field] = this.product[field].replace(/[^0-9]/g, '');
    } else if (field === 'precio') {
      this.product[field] = this.product[field].replace(/[^0-9.]/g, '').replace(/\.(?=.*\.)/g, '');
    }
  }

  filterVolumen() {
    this.product.volumen.cantidad = this.product.volumen.cantidad.replace(/[^0-9]/g, '');
  }

  filterPrecioCompra(field: string) {
    if (field === 'precioCompra') {
      this.product.precioCompra = this.product.precioCompra.replace(/[^0-9.]/g, '');
      this.calcularPrecioVenta();
    }
  }

  filterCantidadUnidades() {
    this.product.cantidadUnidades = parseInt(this.product.cantidadUnidades.toString()) || 0;
  }

  filterCantidadPacks() {
    this.product.cantidadPacks = parseInt(this.product.cantidadPacks.toString()) || 0;
    this.calcularTotalUnidades();
  }

  filterUnidadesPersonalizadas() {
    this.product.unidadesPersonalizadas = parseInt(this.product.unidadesPersonalizadas.toString()) || 0;
    this.calcularTotalUnidades();
  }

  onUnidadesPorPackChange() {
    this.calcularTotalUnidades();
  }

  calcularTotalUnidades() {
    const unidadesDelPack = this.product.cantidadPacks * this.product.unidadesPorPack;
    this.product.cantidadUnidades = unidadesDelPack + this.product.unidadesPersonalizadas;
  }

  getTotalUnidadesFormato(): string {
    if (this.product.cantidadUnidades === 0) {
      return '0';
    }
    const packsCalculados = Math.floor(this.product.cantidadUnidades / this.product.unidadesPorPack);
    const unidadesResto = this.product.cantidadUnidades % this.product.unidadesPorPack;
    
    if (unidadesResto === 0) {
      return `${packsCalculados} packs`;
    } else {
      return `${packsCalculados} packs + ${unidadesResto} unid.`;
    }
  }

  onMargenChange() {
    this.calcularPrecioVenta();
  }

  calcularPrecioVenta() {
    if (!this.product.precioCompra || parseFloat(this.product.precioCompra) <= 0) {
      this.product.iva = '';
      this.product.precioVenta = '';
      this.product.precio = '';
      return;
    }

    const precioCompra = parseFloat(this.product.precioCompra);
    const iva = precioCompra * 0.19;
    const costoTotal = precioCompra + iva;
    const precioVenta = costoTotal + (costoTotal * (this.product.margenGanancia / 100));

    this.product.iva = iva.toFixed(2);
    this.product.precioVenta = precioVenta.toFixed(2);
    this.product.precio = precioVenta.toFixed(2);
  }

  isValid(): boolean {
    if (!this.product.codigo || this.product.codigo.length < 6) {
      return false;
    }
    if (!this.product.nombre || this.product.nombre.trim().length === 0 || this.product.nombre.length > 50) {
      return false;
    }
    if (!this.product.precioCompra || parseFloat(this.product.precioCompra) <= 0) {
      return false;
    }
    if (!this.product.precioVenta || parseFloat(this.product.precioVenta) <= 0) {
      return false;
    }
    if (this.product.cantidadUnidades <= 0) {
      return false;
    }
    if (!this.product.volumen.cantidad || parseInt(this.product.volumen.cantidad) <= 0) {
      return false;
    }
    if (!this.product.categoria) {
      return false;
    }
    return true;
  }

  async saveProduct() {
    if (!this.isValid()) {
      const alert = await this.alertCtrl.create({
        header: 'Campos incompletos',
        message: 'Por favor completa todos los campos requeridos correctamente.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    this.isLoading = true;

    try {
      this.productService.save(this.product);

      const ok = await this.alertCtrl.create({
        header: '¡Éxito!',
        message: 'Producto guardado correctamente.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              const categoria = this.product.categoria;
              this.router.navigate(['/list-products'], { queryParams: { categoria } });
            }
          }
        ]
      });
      await ok.present();
    } catch (error: any) {
      const errorAlert = await this.alertCtrl.create({
        header: 'Error',
        message: error.message || 'Ocurrió un error al guardar el producto.',
        buttons: ['Aceptar']
      });
      await errorAlert.present();
    } finally {
      this.isLoading = false;
    }
  }

  removeFoto() {
    this.product.foto = '';
    this.fotoCapturada = false;
  }
}