import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { ClampedText } from './clamped-text';
import type { ProductRowView } from './product-row-view';
import { ProductStatusBadge } from './product-status-badge';

export type ProductColumn = {
  label: string;
  width: string;
  className?: string;
  cell: (row: ProductRowView) => ReactNode;
  placeholder: ReactNode;
};

const TEXT_PLACEHOLDER = <Skeleton className="h-4 w-24" />;

export const PRODUCT_COLUMNS: ProductColumn[] = [
  {
    label: 'Nazwa',
    width: 'w-full',
    className: 'font-medium',
    cell: (row) => (
      <ClampedText
        text={row.name}
        className="line-clamp-2 w-60 min-w-full whitespace-normal wrap-anywhere"
      />
    ),
    placeholder: <Skeleton className="h-4 w-full" />,
  },
  {
    label: 'SKU',
    width: '',
    className: 'text-xs text-muted-foreground',
    cell: (row) => <ClampedText text={row.sku} className="block w-[13ch] min-w-full truncate" />,
    placeholder: TEXT_PLACEHOLDER,
  },
  {
    label: 'Kategoria',
    width: 'w-[calc(9ch+2rem)]',
    className: 'text-muted-foreground',
    cell: (row) => row.category,
    placeholder: TEXT_PLACEHOLDER,
  },
  {
    label: 'Cena Brutto',
    width: 'w-[calc(14ch+2rem)]',
    className: 'font-medium tabular-nums',
    cell: (row) => row.grossPrice,
    placeholder: TEXT_PLACEHOLDER,
  },
  {
    label: 'Status',
    width: 'w-[calc(10ch+2rem)]',
    cell: (row) => <ProductStatusBadge isAvailable={row.isAvailable} />,
    placeholder: <Skeleton className="h-5 w-20 rounded-4xl" />,
  },
  {
    label: 'Magazyn',
    width: 'w-[calc(9ch+2rem)]',
    className: 'tabular-nums',
    cell: (row) => row.stock,
    placeholder: TEXT_PLACEHOLDER,
  },
];
