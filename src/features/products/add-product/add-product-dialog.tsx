'use client';

import { PlusIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { AddProductFormSkeleton } from './add-product-form-skeleton';

/** Lazy so TanStack Form, Zod and the steps stay out of the first load; warmed on intent. */
const AddProductForm = dynamic(
  () => import('./add-product-form').then((module) => module.AddProductForm),
  { ssr: false, loading: () => <AddProductFormSkeleton /> },
);

const preloadForm = () => {
  void import('./add-product-form');
};

export function AddProductDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            onMouseEnter={preloadForm}
            onFocus={preloadForm}
            onPointerDown={preloadForm}
          />
        }
      >
        <PlusIcon data-icon="inline-start" />
        Dodaj produkt
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <AddProductForm
          onSaved={() => {
            setOpen(false);
            toast.success('Produkt został dodany');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
