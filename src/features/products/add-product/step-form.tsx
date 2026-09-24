import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

import { Button } from '@/components/ui/button';
import { DialogBody, DialogFooter } from '@/components/ui/dialog';

import { LAST_STEP_INDEX } from './product-form-steps';

export function StepForm({
  ref,
  currentStep,
  onBack,
  onSubmit,
  children,
}: {
  ref?: Ref<HTMLFormElement>;
  currentStep: number;
  onBack: () => void;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <form
      ref={ref}
      noValidate
      className="contents"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSubmit();
      }}
    >
      <DialogBody>{children}</DialogBody>
      <DialogFooter>
        {currentStep > 0 && (
          <Button type="button" variant="outline" size="lg" radius="lg" onClick={onBack}>
            <ArrowLeftIcon data-icon="inline-start" />
            Wstecz
          </Button>
        )}
        <Button type="submit" size="lg" className="ms-auto">
          {currentStep === LAST_STEP_INDEX ? (
            'Zapisz produkt'
          ) : (
            <>
              Dalej
              <ArrowRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
