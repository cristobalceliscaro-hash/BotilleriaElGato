import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {

  constructor(private router: Router) { }

  irCrearProducto() {
    this.router.navigate(['/create-product']);
  }

  irListarProductos() {
    this.router.navigate(['/listado']);
  }

}