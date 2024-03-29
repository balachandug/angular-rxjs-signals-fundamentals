import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent {
  
  private productService = inject(ProductService);

  // Just enough here for the template to compile
  pageTitle = 'Products';
  errorMessage = '';

  // Selected product id to highlight the entry
  selectedProductId: number = 0;

  readonly products$ = this.productService.products$
                        .pipe(
                          // tap((p) => console.log(JSON.stringify(p))),
                          catchError(err => {
                            this.errorMessage = err;
                            return EMPTY;
                          }
                        ))

  onSelected(productId: number): void {
    this.selectedProductId = productId;
  }

  
}
