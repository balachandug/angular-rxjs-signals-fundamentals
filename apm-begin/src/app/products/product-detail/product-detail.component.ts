import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
    imports: [NgIf, NgFor, CurrencyPipe]
})
export class ProductDetailComponent implements OnChanges, OnDestroy {
  
  constructor(private productService: ProductService) { }
  @Input() productId: number = 0;
  errorMessage = '';

  // Product to display
  product: Product | null = null;

  // Set the page title
  pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';

  sub!: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    const newProductId = changes['productId'].currentValue;
    if (newProductId) {
      this.sub = this.productService.getProduct(newProductId)
      .pipe(
        tap(() => console.log("In component pipeline")
      )).subscribe({
        next: ((product) => {
          this.product = product;
          this.pageTitle = `Product Detail for: ${this.product?.productName}`;
        }),
        error: ((error) => this.errorMessage = error),
        complete: (() => console.log("In component pipeline"))
      });
    }
  }
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  addToCart(product: Product) {
  }
}
