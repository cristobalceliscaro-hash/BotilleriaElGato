import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonItem,
  IonLabel,
  IonThumbnail,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.page.html',
  styleUrls: ['./list-products.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonItem,
    IonLabel,
    IonThumbnail
  ]
})
export class ListProductsPage {
  inventario: any[] = [];
}
