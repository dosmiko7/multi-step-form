import { Textarea } from '@/components/ui/textarea';

import { FieldShell } from './field-shell';
import { textControlProps, type FieldLike } from './use-field-control';

export function TextareaField({
  field,
  label,
  placeholder,
}: {
  field: FieldLike<string>;
  label: string;
  placeholder?: string;
}) {
  return (
    <FieldShell field={field} label={label}>
      {(control) => <Textarea {...textControlProps(field, control)} placeholder={placeholder} />}
    </FieldShell>
  );
}
