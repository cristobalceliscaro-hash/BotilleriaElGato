import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, checkmark, arrowBack, add, barcode, close, checkmarkCircle } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Product, ProductService, Sale } from '../../services/product.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons
  ],
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
})
export class SalesPage implements OnInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  products: Product[] = [];
  cartItems: Sale[] = [];
  productoActual: Product | null = null;
  codigoBarras = '';
  cantidadVenta = 1;
  Math = Math;
  parseFloat = parseFloat;



  constructor(
    private productService: ProductService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({arrowBack,barcode,close,add,trash,checkmarkCircle,checkmark});
  }

  ngOnInit() {
    this.products = this.productService.getAll();
    this.barcodeInput?.nativeElement?.focus();
  }

  // Buscar producto por código de barras
  onBarcodeEnter() {
    if (!this.codigoBarras.trim()) {
      return;
    }

    const producto = this.productService.getByCodigo(this.codigoBarras);

    if (!producto) {
      this.mostrarAlerta('Producto no encontrado');
      this.codigoBarras = '';
      this.barcodeInput?.nativeElement?.focus();
      return;
    }

    // Si es el mismo producto, solo incrementar cantidad
    if (this.productoActual && this.productoActual.codigo === this.codigoBarras) {
      this.cantidadVenta++;
    } else {
      // Nuevo producto
      this.productoActual = producto;
      this.cantidadVenta = 1;
    }

    this.codigoBarras = '';
    this.barcodeInput?.nativeElement?.focus();
  }

  // Incrementar cantidad rápidamente
  incrementarCantidad() {
    if (this.productoActual && this.cantidadVenta < this.productoActual.cantidadUnidades) {
      this.cantidadVenta++;
    }
  }

  // Decrementar cantidad
  decrementarCantidad() {
    if (this.cantidadVenta > 1) {
      this.cantidadVenta--;
    }
  }

  // Agregar producto al carrito
  agregarAlCarrito() {
    if (!this.productoActual) {
      this.mostrarAlerta('Selecciona un producto primero');
      return;
    }

    if (this.cantidadVenta <= 0) {
      this.mostrarAlerta('La cantidad debe ser mayor a 0');
      return;
    }

    const result = this.productService.recordSale(this.productoActual.codigo, this.cantidadVenta);

    if (result.success && result.sale) {
      this.cartItems.push(result.sale);
      this.productoActual = null;
      this.cantidadVenta = 1;
      this.codigoBarras = '';
      this.barcodeInput?.nativeElement?.focus();
    } else {
      this.mostrarAlerta(result.message);
    }
  }

  // Eliminar producto del carrito
  eliminarDelCarrito(index: number) {
    const venta = this.cartItems[index];
    const producto = this.productService.getByCodigo(venta.codigoProducto);

    if (producto) {
      producto.cantidadUnidades += venta.cantidadVendida;
      const packsPrincipales = Math.floor(producto.cantidadUnidades / producto.unidadesPorPack);
      producto.cantidadPacks = packsPrincipales;
      producto.unidadesPersonalizadas = producto.cantidadUnidades - packsPrincipales * producto.unidadesPorPack;
    }

    this.cartItems.splice(index, 1);
  }

  // Obtener totales
  getTotalCarrito(): number {
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  getCantidadItemsCarrito(): number {
    return this.cartItems.reduce((sum, item) => sum + item.cantidadVendida, 0);
  }

  getTotalGanancia(): number {
    return this.cartItems.reduce((sum, item) => {
      const producto = this.productService.getByCodigo(item.codigoProducto);
      if (producto) {
        const precioCompra = parseFloat(producto.precioCompra) || 0;
        const ganancia = (item.precioUnitario - precioCompra) * item.cantidadVendida;
        return sum + ganancia;
      }
      return sum;
    }, 0);
  }

  getTotalCantidadProductos(): number {
    return this.cartItems.reduce((sum, item) => sum + item.cantidadVendida, 0);
  }

  getSubtotalVenta(): number {
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Finalizar venta
  async finalizarVenta() {
    if (this.cartItems.length === 0) {
      this.mostrarAlerta('El carrito está vacío');
      return;
    }

    const ventaAlert = await this.alertController.create({
      header: 'Confirmar Venta',
      message: `Total: $${this.getTotalCarrito().toFixed(2)} | Ganancia: $${this.getTotalGanancia().toFixed(2)}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.cartItems = [];
            this.productoActual = null;
            this.cantidadVenta = 1;
            this.codigoBarras = '';
            this.barcodeInput?.nativeElement?.focus();
          },
        },
      ],
    });

    await ventaAlert.present();
  }

  // Cancelar producto actual
  cancelarProducto() {
    this.productoActual = null;
    this.cantidadVenta = 1;
    this.codigoBarras = '';
    this.barcodeInput?.nativeElement?.focus();
  }

  // Mostrar alerta simple
  async mostrarAlerta(mensaje: string) {
    const alertObj = await this.alertController.create({
      header: 'Aviso',
      message: mensaje,
      buttons: ['OK'],
    });
    await alertObj.present();
  }

  // Ir atrás
  goBack() {
    this.router.navigate(['/list-products']);
  }
}
