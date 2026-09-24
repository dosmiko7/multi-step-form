import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import type { ProductRowView } from './product-row-view';
import { ProductStatusBadge } from './product-status-badge';

export const COLUMN_WIDTH_CLASSES = {
  fluid: '',
  fixed: 'w-[177px]',
};

export type ProductColumn = {
  label: string;
  width: keyof typeof COLUMN_WIDTH_CLASSES;
  className?: string;
  cell: (row: ProductRowView) => ReactNode;
  placeholder: ReactNode;
};

const TEXT_PLACEHOLDER = <Skeleton className="h-4 w-24" />;

export const PRODUCT_COLUMNS: ProductColumn[] = [
  {
    label: 'Nazwa',
    width: 'fluid',
    className: 'truncate font-medium',
    cell: (row) => row.name,
    placeholder: <Skeleton className="h-4 w-full" />,
  },
  {
    label: 'SKU',
    width: 'fixed',
    className: 'text-xs text-muted-foreground',
    cell: (row) => row.sku,
    placeholder: TEXT_PLACEHOLDER,
  },
  {
    label: 'Kategoria',
    width: 'fixed',
    className: 'text-muted-foreground',
    cell: (row) => row.category,
    placeholder: TEXT_PLACEHOLDER,
  },
  {
    label: 'Cena Brutto',
    width: 'fixed',
    className: 'font-medium tabular-nums',
    cell: (row) => row.grossPrice,
    placeholder: TEXT_PLACEHOLDER,
  },
  {
    label: 'Status',
    width: 'fixed',
    cell: (row) => <ProductStatusBadge isAvailable={row.isAvailable} />,
    placeholder: <Skeleton className="h-5 w-20 rounded-4xl" />,
  },
  {
    label: 'Magazyn',
    width: 'fixed',
    className: 'tabular-nums',
    cell: (row) => row.stock,
    placeholder: TEXT_PLACEHOLDER,
  },
];
