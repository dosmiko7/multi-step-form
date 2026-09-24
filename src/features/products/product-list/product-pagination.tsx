'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { formatProductCount } from './format';

export type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function PaginationSummary({
  page,
  pageCount,
  total,
}: Pick<PaginationProps, 'page' | 'pageCount' | 'total'>) {
  return (
    <p className="text-xs text-muted-foreground">
      Strona {page} z {pageCount} · {formatProductCount(total)}
    </p>
  );
}

type PageItem = number | 'ellipsis';

function buildPageItems(page: number, pageCount: number, siblingCount: number): PageItem[] {
  const anchors = [1, pageCount, page - siblingCount, page, page + siblingCount];
  const visible = [...new Set(anchors)]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);

  return visible.flatMap((value, index) => {
    const previous = visible[index - 1];
    if (previous !== undefined && value - previous > 1) {
      return ['ellipsis' as const, value];
    }
    return [value];
  });
}

function PaginationBar({
  page,
  pageCount,
  onPageChange,
  siblingCount,
  className,
}: Pick<PaginationProps, 'page' | 'pageCount' | 'onPageChange'> & {
  siblingCount: number;
  className: string;
}) {
  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Wstecz"
            className="max-[380px]:pr-1.5! max-[380px]:[&>span]:hidden"
            aria-label="Przejdź do poprzedniej strony"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          />
        </PaginationItem>
        {buildPageItems(page, pageCount, siblingCount).map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === page}
                aria-label={`Przejdź do strony ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            text="Dalej"
            className="max-[380px]:pl-1.5! max-[380px]:[&>span]:hidden"
            aria-label="Przejdź do następnej strony"
            disabled={page === pageCount}
            onClick={() => onPageChange(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function ProductPagination(
  props: Pick<PaginationProps, 'page' | 'pageCount' | 'onPageChange'>,
) {
  if (props.pageCount === 1) {
    return null;
  }

  return (
    <>
      <PaginationBar {...props} siblingCount={0} className="sm:hidden" />
      <PaginationBar {...props} siblingCount={1} className="max-sm:hidden" />
    </>
  );
}
