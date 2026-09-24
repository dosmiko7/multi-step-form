import type { ReactNode } from 'react';
import { cn } from 'cn';

import { Skeleton } from '@/components/ui/skeleton';

import type { ProductRowView } from './product-row-view';
import { ProductStatusBadge } from './product-status-badge';

/** Radii from the .fig file; deliberately off the theme scale. */
const CARD_RADIUS = 'rounded-[12px]';
const PANEL_RADIUS = 'rounded-[9px]';

const DETAIL_LABELS = {
  category: 'Kategoria',
  grossPrice: 'Cena brutto',
  stock: 'Magazyn',
};

function ProductCardShell({
  name,
  sku,
  status,
  children,
}: {
  name: ReactNode;
  sku: ReactNode;
  status: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className={cn('flex flex-col gap-2 border bg-card p-3', CARD_RADIUS)}>
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 flex-col gap-1">
          {name}
          {sku}
        </div>
        {status}
      </div>
      <dl className={cn('flex gap-1 bg-muted p-3', PANEL_RADIUS)}>{children}</dl>
    </li>
  );
}

function ProductCardDetail({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{children}</dd>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <ProductCardShell
      name={<Skeleton className="h-6 w-40" />}
      sku={<Skeleton className="h-4 w-24" />}
      status={<Skeleton className="h-5 w-20 rounded-4xl" />}
    >
      {Object.keys(DETAIL_LABELS).map((detail) => (
        <ProductCardDetail key={detail} label={<Skeleton className="h-4 w-16" />}>
          <Skeleton className="h-5 w-20" />
        </ProductCardDetail>
      ))}
    </ProductCardShell>
  );
}

export function ProductCard({ row }: { row: ProductRowView }) {
  return (
    <ProductCardShell
      name={<p className="text-base leading-6 font-medium wrap-anywhere">{row.name}</p>}
      sku={<p className="truncate text-xs text-muted-foreground">{row.sku}</p>}
      status={<ProductStatusBadge isAvailable={row.isAvailable} />}
    >
      <ProductCardDetail label={DETAIL_LABELS.category}>{row.category}</ProductCardDetail>
      <ProductCardDetail label={DETAIL_LABELS.grossPrice}>
        <span className="font-medium tabular-nums">{row.grossPrice}</span>
      </ProductCardDetail>
      <ProductCardDetail label={DETAIL_LABELS.stock}>{row.stock}</ProductCardDetail>
    </ProductCardShell>
  );
}
