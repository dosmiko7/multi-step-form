import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { PRODUCTS_PER_PAGE } from '@/features/products/hooks/use-products-page';

import { ProductCard, ProductCardSkeleton } from './product-card';
import { PaginationSummary, ProductPagination, type PaginationProps } from './product-pagination';
import type { ProductRowView } from './product-row-view';

function ProductCardListFrame({ footer, children }: { footer: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 lg:hidden">
      <ul className="flex flex-col gap-2">{children}</ul>
      <div className="flex flex-col items-center gap-4">{footer}</div>
    </div>
  );
}

export function ProductCardListSkeleton() {
  return (
    <ProductCardListFrame
      footer={
        <>
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-8 w-60" />
        </>
      }
    >
      {Array.from({ length: PRODUCTS_PER_PAGE }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </ProductCardListFrame>
  );
}

export function ProductCardList({
  rows,
  pagination,
}: {
  rows: ProductRowView[];
  pagination: PaginationProps;
}) {
  return (
    <ProductCardListFrame
      footer={
        <>
          <PaginationSummary {...pagination} />
          <ProductPagination {...pagination} />
        </>
      }
    >
      {rows.map((row) => (
        <ProductCard key={row.id} row={row} />
      ))}
    </ProductCardListFrame>
  );
}
