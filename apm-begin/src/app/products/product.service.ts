import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  // private http = inject(HttpClient); This is another option of DI
  constructor(private http: HttpClient, 
              private errorService: HttpErrorService, 
              private reviewService: ReviewService) { 
    
  }

  private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  productSelected$ = this.productSelectedSubject.asObservable();

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap((p) => console.log(JSON.stringify(p))),
      shareReplay(1), // Operators before shareReplay will be executed once, that is before data caching
      tap(() => console.log("After sharePlay")), // This will be executed after data caching
      catchError(err => this.handleError(err))
    );

  readonly product1$ = this.productSelected$
  .pipe(
    filter(Boolean), // This will filter out undefined values
    switchMap(id => {
      const url = `${this.productsUrl}/${id}`;
      return this.http.get<Product>(url)
      .pipe(
        switchMap(product => this.getProductWithReview(product)),
        catchError(err => this.handleError(err))
      );
    })
  )

  product$ = combineLatest([
    this.products$,
    this.productSelected$
  ]).pipe(
    map(([products, selectedProductId]) => {
      return products.find(product => product.id === selectedProductId);
    }),
    filter(Boolean),
    switchMap(product => this.getProductWithReview(product)),
    catchError(err => this.handleError(err))
  )

  productSelected(productId: number): void {
    this.productSelectedSubject.next(productId);
  }

  private getProductWithReview(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
      .pipe(
        map(reviews => ({ ...product, reviews} as Product))
      )
    } else {
      return of(product)
    }
  }

  private handleError(err: HttpErrorResponse) {
    const errorMessage = this.errorService.formatError(err);
    return throwError(() => errorMessage);
  }
}
