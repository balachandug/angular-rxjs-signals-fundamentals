import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NgIf, NgFor, NgClass } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
  imports: [NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent implements OnInit, OnDestroy{
  
  private productService = inject(ProductService);

  // Just enough here for the template to compile
  pageTitle = 'Products';
  errorMessage = '';
  sub!: Subscription;

  // Products
  products: Product[] = [];

  // Selected product id to highlight the entry
  selectedProductId: number = 0;

  ngOnInit(): void {
    // this.sub = this.productService.getProducts()
    // .pipe(
    //   tap(() => console.log("In component pipeline")
    // ))
    // .subscribe({
    //   next: products => this.products = products,
    //   error: error => this.errorMessage = error
    // });

    // Below is handling the error in the pipeline. This is a better approach than the above one.
    this.sub = this.productService.getProducts()
    .pipe(
      tap(() => console.log("In component pipeline")),
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      }
    )) // The catchError function expects to return a replacement observable
    .subscribe(products => this.products = products);

  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSelected(productId: number): void {
    this.selectedProductId = productId;
  }

  
}
