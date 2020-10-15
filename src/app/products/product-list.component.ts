import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';


import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  // Action stream
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  // combine with Data Stream
  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
      .pipe(
        startWith(0)
      )
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true
        )),
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );



  constructor(private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }

  onAdd (): void {
    this.productService.addProduct();
  }
  // called each time user selects item from drop-down
  onSelected (categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId)
  }
}
