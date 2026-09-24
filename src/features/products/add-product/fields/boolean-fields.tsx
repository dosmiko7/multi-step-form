import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

import { FieldShell } from './field-shell';
import { toggleControlProps, type FieldLike } from './use-field-control';

export function CheckboxField({
  field,
  label,
  controls,
}: {
  field: FieldLike<boolean>;
  label: string;
  controls?: string;
}) {
  return (
    <FieldShell field={field} label={label} orientation="horizontal">
      {(control) => <Checkbox {...toggleControlProps(field, control)} aria-controls={controls} />}
    </FieldShell>
  );
}

export function SwitchField({ field, label }: { field: FieldLike<boolean>; label: string }) {
  return (
    <FieldShell field={field} label={label} orientation="horizontal">
      {(control) => <Switch {...toggleControlProps(field, control)} />}
    </FieldShell>
  );
}
