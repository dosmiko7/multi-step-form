import type { ReactNode } from 'react';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useFieldControl, type ControlProps, type FieldErrorState } from './use-field-control';

export function FieldShell({
  field,
  label,
  orientation = 'vertical',
  className,
  children,
}: {
  field: FieldErrorState;
  label: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  children: (control: ControlProps) => ReactNode;
}) {
  const { control, errorId, errors, isInvalid } = useFieldControl(field);
  const isHorizontal = orientation === 'horizontal';

  const labelElement = <FieldLabel htmlFor={control.id}>{label}</FieldLabel>;
  const controlElement = children(control);
  const [first, second] = isHorizontal
    ? [controlElement, labelElement]
    : [labelElement, controlElement];

  return (
    <Field orientation={orientation} data-invalid={isInvalid || undefined} className={className}>
      {first}
      {second}
      <FieldError id={errorId} errors={errors} />
    </Field>
  );
}
