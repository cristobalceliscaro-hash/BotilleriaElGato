import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, FormsModule } from '@angular/common';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateProductPage {

  seleccionarFoto(event: any) {
    console.log('Foto seleccionada', event.target.files[0]);
  }

}
