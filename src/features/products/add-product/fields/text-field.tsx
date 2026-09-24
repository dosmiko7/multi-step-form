import type { ComponentProps } from 'react';

import { Input } from '@/components/ui/input';

import { FieldShell } from './field-shell';
import { textControlProps, type FieldLike } from './use-field-control';

export function TextField({
  field,
  label,
  className,
  ...inputProps
}: {
  field: FieldLike<string>;
  label: string;
} & Omit<ComponentProps<typeof Input>, 'id' | 'name' | 'value' | 'onChange' | 'onBlur'>) {
  return (
    <FieldShell field={field} label={label} className={className}>
      {(control) => <Input {...textControlProps(field, control)} {...inputProps} />}
    </FieldShell>
  );
}
