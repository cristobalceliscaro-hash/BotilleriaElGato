import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  constructor(private router: Router) {}

  goToCreateProduct() {
    this.router.navigate(['/create-product']);
  }

  goToListProducts() {
    this.router.navigate(['/list-products']);
  }

  goToSales() {
    this.router.navigate(['/sales']);
  }

  goToSalesHistory() {
    this.router.navigate(['/sales-history']);
  }
}
