import { Injectable } from '@angular/core';

export interface Product {
  codigo: string;
  nombre: string;
  precio: string;
  descripcion: string;
  ml: string;
  categoria: string;
  foto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Product[] = [];

  constructor() {
    this.load();
  }

  // Cargar desde localStorage
  load() {
    const data = localStorage.getItem('products');
    if (data) {
      this.products = JSON.parse(data);
    }
  }

  // Guardar en localStorage
  saveStorage() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  // Obtener todos
  getAll(): Product[] {
    return [...this.products];
  }

  // Guardar nuevo producto
  save(product: Product) {
    this.products.push(product);
    this.saveStorage();
  }

  // Obtener producto por código
  getByCodigo(codigo: string): Product | undefined {
    return this.products.find(p => p.codigo === codigo);
  }

  // Actualizar producto
  update(product: Product) {
    const index = this.products.findIndex(p => p.codigo === product.codigo);
    if (index !== -1) {
      this.products[index] = { ...product };
      this.saveStorage();
    }
  }

  // Eliminar producto prueba
  delete(codigo: string) {
    this.products = this.products.filter(p => p.codigo !== codigo);
    this.saveStorage();
  }
}
