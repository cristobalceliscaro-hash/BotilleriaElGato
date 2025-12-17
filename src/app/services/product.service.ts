import { Injectable } from '@angular/core';

export interface Product {
  codigo: string;
  nombre: string;
  precio: string;
  descripcion: string;
  volumen: {
    cantidad: string;
    unidad: 'ml' | 'lt';
  };
  categoria: 'Cervezas' | 'Bebidas o Aguas' | 'Jugos' | 'Vinos' | 'Destilados';
  foto: string;
  // Nuevos campos de inventario y precios
  unidadesPorPack: 6 | 8 | 12 | 24;
  cantidadPacks: number;
  unidadesPersonalizadas: number;
  cantidadUnidades: number;
  precioCompra: string;
  margenGanancia: 11 | 21 | 30 | 35 | 40;
  precioVenta: string;
  iva: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface Sale {
  id: string;
  codigoProducto: string;
  nombreProducto: string;
  categoriaProducto: Product['categoria'];
  cantidadVendida: number;
  precioUnitario: number;
  subtotal: number;
  fechaVenta: string;
}

export interface SaleReport {
  totalVentas: number;
  totalGanancia: number;
  cantidadTransacciones: number;
  ventasPorCategoria: { [key: string]: number };
  productosMasVendidos: { codigo: string; nombre: string; cantidad: number; ganancia: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Product[] = [];
  private sales: Sale[] = [];
  private readonly STORAGE_KEY = 'botilleria_products';
  private readonly SALES_KEY = 'botilleria_sales';

  constructor() {
    this.load();
    this.loadSales();
  }

  load() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.products = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.products = [];
    }
  }

  loadSales() {
    try {
      const data = localStorage.getItem(this.SALES_KEY);
      if (data) {
        this.sales = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      this.sales = [];
    }
  }

  private saveStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
    } catch (error) {
      console.error('Error al guardar productos:', error);
    }
  }

  private saveSalesStorage() {
    try {
      localStorage.setItem(this.SALES_KEY, JSON.stringify(this.sales));
    } catch (error) {
      console.error('Error al guardar ventas:', error);
    }
  }

  getAll(): Product[] {
    return [...this.products];
  }

  getByCategoria(categoria: Product['categoria']): Product[] {
    return this.products.filter(p => p.categoria === categoria);
  }

  save(product: Product) {
    const ahora = new Date().toISOString();
    product.fechaCreacion = ahora;
    product.fechaActualizacion = ahora;
    
    if (this.products.some(p => p.codigo === product.codigo)) {
      throw new Error(`Ya existe un producto con el código ${product.codigo}`);
    }
    
    this.products.push(product);
    this.saveStorage();
  }

  update(codigoOriginal: string, productActualizado: Product) {
    const index = this.products.findIndex(p => p.codigo === codigoOriginal);
    
    if (index === -1) {
      throw new Error(`Producto con código ${codigoOriginal} no encontrado`);
    }

    if (productActualizado.codigo !== codigoOriginal) {
      if (this.products.some(p => p.codigo === productActualizado.codigo)) {
        throw new Error(`Ya existe un producto con el código ${productActualizado.codigo}`);
      }
    }

    productActualizado.fechaActualizacion = new Date().toISOString();
    this.products[index] = productActualizado;
    this.saveStorage();
  }

  getByCodigo(codigo: string): Product | undefined {
    return this.products.find(p => p.codigo === codigo);
  }

  deleteProduct(codigo: string) {
    const index = this.products.findIndex(p => p.codigo === codigo);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveStorage();
    }
  }

  searchByNombre(termino: string): Product[] {
    const termLower = termino.toLowerCase();
    return this.products.filter(p => p.nombre.toLowerCase().includes(termLower));
  }

  getTotalProductos(): number {
    return this.products.length;
  }

  getValorTotalInventario(): number {
    return this.products.reduce((total, p) => {
      const precio = parseFloat(p.precio) || 0;
      return total + precio;
    }, 0);
  }

  exportData(): string {
    return JSON.stringify(this.products, null, 2);
  }

  importData(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        this.products = data;
        this.saveStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  }

  // Métodos de cálculo de precios
  calcularIVA(precioCompra: number): number {
    return precioCompra * 0.19;
  }

  calcularPrecioVenta(precioCompra: number, margenGanancia: number): number {
    const iva = this.calcularIVA(precioCompra);
    const costoTotal = precioCompra + iva;
    return costoTotal + (costoTotal * (margenGanancia / 100));
  }

  // Agrupar productos por categoría con cálculos
  getProductosPorCategoria() {
    const categorias: any = {};
    this.products.forEach(p => {
      if (!categorias[p.categoria]) {
        categorias[p.categoria] = [];
      }
      categorias[p.categoria].push(p);
    });
    return categorias;
  }

  // Obtener total de unidades por categoría
  getTotalUnidadesPorCategoria(categoria: Product['categoria']): number {
    return this.products
      .filter(p => p.categoria === categoria)
      .reduce((total, p) => total + (p.cantidadUnidades || 0), 0);
  }

  // Obtener total de packs por categoría
  getTotalPacksPorCategoria(categoria: Product['categoria']): number {
    return this.products
      .filter(p => p.categoria === categoria)
      .reduce((total, p) => {
        const packs = p.cantidadUnidades / p.unidadesPorPack;
        return total + packs;
      }, 0);
  }

  // Obtener valor total de inventario por categoría
  getValorInventarioPorCategoria(categoria: Product['categoria']): number {
    return this.products
      .filter(p => p.categoria === categoria)
      .reduce((total, p) => {
        const precioVenta = parseFloat(p.precioVenta) || 0;
        return total + (precioVenta * p.cantidadUnidades);
      }, 0);
  }

  // ========== MÉTODOS DE VENTAS ==========

  // Registrar una venta y descontar del inventario
  recordSale(codigoProducto: string, cantidadVendida: number): { success: boolean; message: string; sale?: Sale } {
    const producto = this.getByCodigo(codigoProducto);
    
    if (!producto) {
      return { success: false, message: 'Producto no encontrado' };
    }

    if (cantidadVendida <= 0) {
      return { success: false, message: 'La cantidad debe ser mayor a 0' };
    }

    if (producto.cantidadUnidades < cantidadVendida) {
      return { success: false, message: `Stock insuficiente. Disponibles: ${producto.cantidadUnidades}` };
    }

    // Crear registro de venta
    const precioUnitario = parseFloat(producto.precioVenta) || 0;
    const sale: Sale = {
      id: Date.now().toString(),
      codigoProducto,
      nombreProducto: producto.nombre,
      categoriaProducto: producto.categoria,
      cantidadVendida,
      precioUnitario,
      subtotal: cantidadVendida * precioUnitario,
      fechaVenta: new Date().toISOString()
    };

    // Descontar del inventario
    producto.cantidadUnidades -= cantidadVendida;
    
    // Recalcular packs
    const packsPrincipales = Math.floor(producto.cantidadUnidades / producto.unidadesPorPack);
    producto.cantidadPacks = packsPrincipales;
    producto.unidadesPersonalizadas = producto.cantidadUnidades - (packsPrincipales * producto.unidadesPorPack);

    // Guardar cambios
    this.products[this.products.findIndex(p => p.codigo === codigoProducto)] = producto;
    this.saveStorage();

    // Guardar venta
    this.sales.push(sale);
    this.saveSalesStorage();

    return { success: true, message: 'Venta registrada exitosamente', sale };
  }

  // Obtener todas las ventas
  getAllSales(): Sale[] {
    return [...this.sales];
  }

  // Obtener ventas por categoría
  getSalesByCategoria(categoria: Product['categoria']): Sale[] {
    return this.sales.filter(s => s.categoriaProducto === categoria);
  }

  // Obtener ventas por rango de fechas
  getSalesByDateRange(startDate: Date, endDate: Date): Sale[] {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return this.sales.filter(s => {
      const saleTime = new Date(s.fechaVenta).getTime();
      return saleTime >= start && saleTime <= end;
    });
  }

  // Obtener reporte de ventas
  getSalesReport(startDate?: Date, endDate?: Date): SaleReport {
    let ventasFiltradasFecha = this.sales;

    if (startDate && endDate) {
      ventasFiltradasFecha = this.getSalesByDateRange(startDate, endDate);
    }

    // Calcular totales
    const totalVentas = ventasFiltradasFecha.reduce((sum, s) => sum + s.subtotal, 0);
    const totalGanancia = ventasFiltradasFecha.reduce((sum, s) => {
      const producto = this.getByCodigo(s.codigoProducto);
      if (producto) {
        const precioCompra = parseFloat(producto.precioCompra) || 0;
        const ganancia = (s.precioUnitario - precioCompra) * s.cantidadVendida;
        return sum + ganancia;
      }
      return sum;
    }, 0);

    // Agrupar por categoría
    const ventasPorCategoria: { [key: string]: number } = {};
    ventasFiltradasFecha.forEach(s => {
      ventasPorCategoria[s.categoriaProducto] = (ventasPorCategoria[s.categoriaProducto] || 0) + s.subtotal;
    });

    // Productos más vendidos
    const productoMap: { [key: string]: { cantidad: number; ganancia: number; nombre: string } } = {};
    ventasFiltradasFecha.forEach(s => {
      if (!productoMap[s.codigoProducto]) {
        const producto = this.getByCodigo(s.codigoProducto);
        const precioCompra = producto ? parseFloat(producto.precioCompra) || 0 : 0;
        const ganancia = (s.precioUnitario - precioCompra) * s.cantidadVendida;
        productoMap[s.codigoProducto] = { cantidad: 0, ganancia: 0, nombre: s.nombreProducto };
      }
      productoMap[s.codigoProducto].cantidad += s.cantidadVendida;
      const producto = this.getByCodigo(s.codigoProducto);
      if (producto) {
        const precioCompra = parseFloat(producto.precioCompra) || 0;
        productoMap[s.codigoProducto].ganancia += (s.precioUnitario - precioCompra) * s.cantidadVendida;
      }
    });

    const productosMasVendidos = Object.entries(productoMap)
      .map(([codigo, data]) => ({
        codigo,
        nombre: data.nombre,
        cantidad: data.cantidad,
        ganancia: data.ganancia
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    return {
      totalVentas,
      totalGanancia,
      cantidadTransacciones: ventasFiltradasFecha.length,
      ventasPorCategoria,
      productosMasVendidos
    };
  }

  // Deshacer última venta
  undoLastSale(): boolean {
    if (this.sales.length === 0) {
      return false;
    }

    const ultimaVenta = this.sales.pop();
    if (ultimaVenta) {
      const producto = this.getByCodigo(ultimaVenta.codigoProducto);
      if (producto) {
        producto.cantidadUnidades += ultimaVenta.cantidadVendida;
        const packsPrincipales = Math.floor(producto.cantidadUnidades / producto.unidadesPorPack);
        producto.cantidadPacks = packsPrincipales;
        producto.unidadesPersonalizadas = producto.cantidadUnidades - (packsPrincipales * producto.unidadesPorPack);
        this.saveStorage();
      }
      this.saveSalesStorage();
      return true;
    }

    return false;
  }

  // Limpiar historial de ventas
  clearSalesHistory(): boolean {
    this.sales = [];
    this.saveSalesStorage();
    return true;
  }
}
