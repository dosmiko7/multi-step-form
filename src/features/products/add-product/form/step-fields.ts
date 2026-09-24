import type { ProductFormValues } from './product-form-schema';
import type { ProductFormApi } from './use-product-form';

type StepKey = keyof ProductFormValues;

type FieldName = Parameters<ProductFormApi['setFieldMeta']>[0];

const stepFieldNames = (form: ProductFormApi, step: StepKey) =>
  Object.keys(form.state.fieldMeta).filter((name) => name.startsWith(`${step}.`)) as FieldName[];

export function focusFirstField(stepForm: HTMLFormElement | null) {
  stepForm?.querySelector<HTMLElement>('[name]')?.focus();
}

/**
 * Clicking through a step says the user has now seen all of it, so every field is marked by the
 * same blur flag that normally lets a single field report.
 */
export function revealStepErrors(form: ProductFormApi, step: StepKey) {
  for (const name of stepFieldNames(form, step)) {
    form.setFieldMeta(name, (meta) => ({ ...meta, isBlurred: true }));
  }
}

/**
 * Which fields are invalid comes from the store (React has not painted `aria-invalid` yet);
 * which one to focus comes from the DOM, because document order is what the user sees.
 */
export function focusFirstInvalidField(
  form: ProductFormApi,
  step: StepKey,
  stepForm: HTMLFormElement | null,
) {
  if (!stepForm) {
    return;
  }

  const invalidNames = new Set<string>(
    stepFieldNames(form, step).filter((name) => (form.getFieldMeta(name)?.errors.length ?? 0) > 0),
  );

  if (invalidNames.size === 0) {
    return;
  }

  for (const control of stepForm.querySelectorAll<HTMLElement>('[name]')) {
    if (invalidNames.has(control.getAttribute('name') ?? '')) {
      control.focus();
      return;
    }
  }
}
