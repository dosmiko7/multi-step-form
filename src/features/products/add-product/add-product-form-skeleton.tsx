import { DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { FormStepper } from './form-stepper';

const FIELD_ROW_INDEXES = [0, 1];

export function AddProductFormSkeleton() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Dodaj nowy produkt</DialogTitle>
      </DialogHeader>
      <FormStepper currentStep={0} />

      <DialogBody className="overflow-hidden">
        {FIELD_ROW_INDEXES.map((row) => (
          <div key={row} className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-[60px]" />
            <Skeleton className="h-[60px]" />
          </div>
        ))}
        <Skeleton className="h-[92px]" />
      </DialogBody>

      <DialogFooter>
        <Skeleton className="ms-auto h-9 w-[88px] rounded-full" />
      </DialogFooter>
    </>
  );
}
