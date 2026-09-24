'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGoToFirstPage } from '@/features/products/hooks/use-products-page';
import { useProducts } from '@/features/products/stores/products-store';

import { FormStepper } from './form-stepper';
import {
  availabilitySchema,
  basicsSchema,
  pricingSchema,
  productFormSchema,
} from './form/product-form-schema';
import { focusFirstField, focusFirstInvalidField, revealStepErrors } from './form/step-fields';
import { usePriceRecalculation } from './form/use-price-recalculation';
import { useProductForm } from './form/use-product-form';
import { LAST_STEP_INDEX, PRODUCT_FORM_STEPS, type ProductFormStepKey } from './product-form-steps';
import { StepForm } from './step-form';
import { AvailabilityStep } from './steps/availability-step';
import { BasicsStep } from './steps/basics-step';
import { PricingStep } from './steps/pricing-step';

/**
 * Pinned to the whole-form schema's shape: `form.FormGroup`'s inferred validator type would
 * accept a step paired with the wrong schema.
 */
const STEP_SCHEMAS = {
  basics: basicsSchema,
  pricing: pricingSchema,
  availability: availabilitySchema,
} satisfies { [Key in ProductFormStepKey]: (typeof productFormSchema.shape)[Key] };

export function AddProductForm({ onSaved }: { onSaved: () => void }) {
  const { addProduct } = useProducts();
  const [currentStep, setCurrentStep] = useState(0);
  const stepFormRef = useRef<HTMLFormElement>(null);
  const goToFirstPage = useGoToFirstPage();

  const form = useProductForm((product) => {
    addProduct(product);
    goToFirstPage();
    onSaved();
  });
  const recalculatePrice = usePriceRecalculation(form);

  const goBack = () => setCurrentStep((step) => step - 1);
  const goNext = () => setCurrentStep((step) => step + 1);

  /**
   * The keyed group remounts the whole step, dropping focus on `<body>`, so each step the user
   * moves to focuses its first field. The dialog places focus itself on the way in, and tracking
   * the focused step keeps that intact under Strict Mode's double-run of mount effects.
   */
  const focusedStep = useRef(currentStep);

  useEffect(() => {
    if (focusedStep.current === currentStep) {
      return;
    }

    focusedStep.current = currentStep;
    focusFirstField(stepFormRef.current);
  }, [currentStep]);

  const stepBodies = {
    basics: <BasicsStep form={form} />,
    pricing: <PricingStep form={form} onPriceEdit={recalculatePrice} />,
    availability: <AvailabilityStep form={form} />,
  } satisfies Record<ProductFormStepKey, ReactNode>;

  const activeStep = PRODUCT_FORM_STEPS[currentStep];
  const completeStep = currentStep === LAST_STEP_INDEX ? () => void form.handleSubmit() : goNext;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Dodaj nowy produkt</DialogTitle>
      </DialogHeader>
      <FormStepper currentStep={currentStep} />

      {/* Focus lands on the step's first control, which does not say which step was reached. */}
      <p aria-live="polite" className="sr-only">
        {`Krok ${currentStep + 1} z ${PRODUCT_FORM_STEPS.length}: ${activeStep.title}`}
      </p>

      <form.FormGroup
        key={activeStep.key}
        name={activeStep.key}
        validators={{ onDynamic: STEP_SCHEMAS[activeStep.key] }}
        onGroupSubmitInvalid={() => {
          revealStepErrors(form, activeStep.key);
          focusFirstInvalidField(form, activeStep.key, stepFormRef.current);
        }}
        onGroupSubmit={completeStep}
      >
        {(group) => (
          <StepForm
            ref={stepFormRef}
            currentStep={currentStep}
            onBack={goBack}
            onSubmit={() => void group.handleSubmit()}
          >
            {stepBodies[activeStep.key]}
          </StepForm>
        )}
      </form.FormGroup>
    </>
  );
}
