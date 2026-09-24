'use client';

import { Suspense } from 'react';

import { AddProductDialog } from '@/features/products/add-product/add-product-dialog';
import { useProductsPage } from '@/features/products/hooks/use-products-page';
import { useProducts } from '@/features/products/stores/products-store';

import { formatProductCount } from './format';
import { ProductCardList, ProductCardListSkeleton } from './product-card-list';
import { toProductRowView } from './product-row-view';
import { ProductTable, ProductTableSkeleton } from './product-table';

function PaginatedProductsSkeleton() {
  return (
    <>
      <ProductTableSkeleton />
      <ProductCardListSkeleton />
    </>
  );
}

function PaginatedProducts() {
  const { products } = useProducts();
  const { page, pageCount, goToPage, visibleProducts } = useProductsPage(products);

  const rows = visibleProducts.map(toProductRowView);
  const pagination = { page, pageCount, total: products.length, onPageChange: goToPage };

  return (
    <>
      <ProductTable rows={rows} pagination={pagination} />
      <ProductCardList rows={rows} pagination={pagination} />
    </>
  );
}

export function ProductList() {
  const { products, hasReadStorage } = useProducts();
  const skeleton = <PaginatedProductsSkeleton />;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Produkty</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {formatProductCount(products.length)} w katalogu
          </p>
        </div>
        <AddProductDialog />
      </div>

      <Suspense fallback={skeleton}>{hasReadStorage ? <PaginatedProducts /> : skeleton}</Suspense>
    </div>
  );
}
