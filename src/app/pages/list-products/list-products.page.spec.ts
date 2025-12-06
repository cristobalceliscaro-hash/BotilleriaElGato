import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListProductsPage } from './list-products.page';

describe('ListProductsPage', () => {
  let component: ListProductsPage;
  let fixture: ComponentFixture<ListProductsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
