import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PRODUCTS_PER_PAGE } from '@/features/products/hooks/use-products-page';

import { PRODUCT_COLUMNS } from './product-columns';
import { PaginationSummary, ProductPagination, type PaginationProps } from './product-pagination';
import type { ProductRowView } from './product-row-view';

const PLACEHOLDER_ROW = 'placeholder';

type TableRowValue = ProductRowView | typeof PLACEHOLDER_ROW;

const PLACEHOLDER_ROWS: TableRowValue[] = Array.from(
  { length: PRODUCTS_PER_PAGE },
  () => PLACEHOLDER_ROW,
);

function TableFrame({ rows }: { rows: TableRowValue[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {PRODUCT_COLUMNS.map((column) => (
            <TableHead key={column.label} className={column.width}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={row === PLACEHOLDER_ROW ? index : row.id}>
            {PRODUCT_COLUMNS.map((column) => (
              <TableCell key={column.label} className={column.className}>
                {row === PLACEHOLDER_ROW ? column.placeholder : column.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TablePanel({ footer, children }: { footer: ReactNode; children: ReactNode }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border bg-card lg:block">
      {children}
      <div className="flex h-16 items-center justify-between gap-4 border-t bg-surface-subtle px-4">
        {footer}
      </div>
    </div>
  );
}

export function ProductTableSkeleton() {
  return (
    <TablePanel
      footer={
        <>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-60" />
        </>
      }
    >
      <TableFrame rows={PLACEHOLDER_ROWS} />
    </TablePanel>
  );
}

export function ProductTable({
  rows,
  pagination,
}: {
  rows: ProductRowView[];
  pagination: PaginationProps;
}) {
  return (
    <TablePanel
      footer={
        <>
          <PaginationSummary {...pagination} />
          <ProductPagination {...pagination} />
        </>
      }
    >
      <TableFrame rows={rows} />
    </TablePanel>
  );
}
