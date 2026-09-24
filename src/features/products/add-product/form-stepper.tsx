import { CheckIcon } from 'lucide-react';
import { Fragment } from 'react';

import { cn } from 'cn';

import { PRODUCT_FORM_STEPS } from './product-form-steps';

export function FormStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="border-b px-4 py-6 sm:py-3">
      <ol
        aria-label="Postęp formularza"
        className="flex items-start justify-between gap-4 sm:items-center sm:justify-start"
      >
        {PRODUCT_FORM_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isReached = isCompleted || isCurrent;

          return (
            <Fragment key={step.key}>
              {index > 0 && (
                <li
                  aria-hidden
                  className={cn(
                    'hidden h-px w-[67px] shrink-0 sm:block',
                    isReached ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
              <li
                aria-current={isCurrent ? 'step' : undefined}
                className="flex flex-1 flex-col items-start gap-3 sm:flex-none sm:flex-row sm:items-center"
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                    isReached
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? <CheckIcon className="size-4" /> : index + 1}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span
                    className={cn(
                      'text-sm leading-5 font-medium',
                      isReached ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.subtitle}</span>
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
