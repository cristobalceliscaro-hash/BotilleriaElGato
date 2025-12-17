import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSegment, IonSegmentButton, IonLabel, IonIcon, IonDatetime, IonItem, IonNote, AlertController, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, download, trash } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Product, ProductService, SaleReport } from '../../services/product.service';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonDatetime,
    IonItem,
    IonNote,
    IonButtons
  ],
  templateUrl: './sales-history.page.html',
  styleUrls: ['./sales-history.page.scss'],
})
export class SalesHistoryPage implements OnInit {
  segmentView: 'report' | 'history' | 'products' = 'report';
  report: SaleReport | null = null;
  startDate = '';
  endDate = '';
  categoryFilter = 'Todos';
  categorias: Product['categoria'][] = ['Cervezas', 'Bebidas o Aguas', 'Jugos', 'Vinos', 'Destilados'];

  constructor(
    private productService: ProductService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ arrowBack, download, trash });
  }

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    let start: Date | undefined;
    let end: Date | undefined;

    if (this.startDate && this.endDate) {
      start = new Date(this.startDate);
      end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
    }

    this.report = this.productService.getSalesReport(start, end);
  }

  onDateRangeChange() {
    this.loadReport();
  }

  getGananciaCategoria(categoria: string): number {
    if (!this.report) return 0;
    // Calculamos ganancia como diferencia entre venta y costo
    const ventas = this.productService.getSalesByCategoria(categoria as Product['categoria']);
    return ventas.reduce((sum, venta) => {
      const producto = this.productService.getByCodigo(venta.codigoProducto);
      if (producto) {
        const precioCompra = parseFloat(producto.precioCompra) || 0;
        return sum + ((venta.precioUnitario - precioCompra) * venta.cantidadVendida);
      }
      return sum;
    }, 0);
  }

  async exportarReporte() {
    if (!this.report) return;

    const dataExport = {
      fecha: new Date().toISOString(),
      periodo: this.startDate && this.endDate ? `${this.startDate} a ${this.endDate}` : 'Todo el tiempo',
      resumen: {
        totalVentas: this.report.totalVentas,
        totalGanancia: this.report.totalGanancia,
        cantidadTransacciones: this.report.cantidadTransacciones
      },
      ventasPorCategoria: this.report.ventasPorCategoria,
      productosMasVendidos: this.report.productosMasVendidos
    };

    const jsonString = JSON.stringify(dataExport, null, 2);
    console.log('Reporte exportado:', jsonString);

    const alert = await this.alertController.create({
      header: 'Reporte Exportado',
      message: 'El reporte ha sido preparado para descargar',
      buttons: ['OK']
    });
    await alert.present();
  }

  async limpiarHistorial() {
    const alert = await this.alertController.create({
      header: 'Confirmar Acción',
      message: '¿Estás seguro de que deseas limpiar todo el historial de ventas? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Limpiar',
          handler: () => {
            this.productService.clearSalesHistory();
            this.loadReport();
          },
        },
      ],
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/list-products']);
  }

  getAllSales() {
    return this.productService.getAllSales();
  }

  getSalesFormatted() {
    return this.getAllSales().map(sale => ({
      ...sale,
      fechaFormato: new Date(sale.fechaVenta).toLocaleString()
    }));
  }

  getMathMax(a: number, b: number): number {
    return Math.max(a, b);
  }
}
