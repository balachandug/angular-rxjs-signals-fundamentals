import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
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

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap((p) => console.log(JSON.stringify(p))),
      shareReplay(1),
      tap(() => console.log("After sharePlay")),
      catchError(err => this.handleError(err))
    );

  getProduct(id: number): Observable<Product> {
    const url = `${this.productsUrl}/${id}`;
    return this.http.get<Product>(url)
    .pipe(
      tap(() => console.log("In Http Get Product")),
      switchMap(product => this.getProductWithReview(product)),
      tap(x => console.log(x)),
      catchError(err => this.handleError(err))
    );
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
