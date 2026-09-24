'use client';

import { useRef, useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function isClamped(element: HTMLElement | null) {
  return element !== null && element.scrollHeight > element.clientHeight;
}

export function ProductName({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);

  return (
    <Tooltip
      open={open}
      onOpenChange={(nextOpen) => setOpen(nextOpen && isClamped(nameRef.current))}
    >
      <TooltipTrigger
        render={<span ref={nameRef} className="line-clamp-2 whitespace-normal wrap-anywhere" />}
      >
        {name}
      </TooltipTrigger>
      <TooltipContent className="wrap-anywhere">{name}</TooltipContent>
    </Tooltip>
  );
}
