'use client';

import { useRef, useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function isCut(element: HTMLElement | null) {
  return (
    element !== null &&
    (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight)
  );
}

export function ClampedText({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  return (
    <Tooltip open={open} onOpenChange={(nextOpen) => setOpen(nextOpen && isCut(textRef.current))}>
      <TooltipTrigger render={<span ref={textRef} className={className} />}>{text}</TooltipTrigger>
      <TooltipContent className="wrap-anywhere">{text}</TooltipContent>
    </Tooltip>
  );
}
