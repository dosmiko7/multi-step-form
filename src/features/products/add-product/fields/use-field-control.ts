import { useId, type ChangeEvent } from 'react';

export type FieldIssue = { message?: string } | undefined;

type FieldMetaLike = {
  errors: FieldIssue[];
  isBlurred: boolean;
};

export type FieldErrorState = { state: { meta: FieldMetaLike } };

/**
 * The slice of TanStack Form's field API the field wrappers need — structural, so
 * `AnyFieldApi`'s `any` stays out of the markup.
 */
export type FieldLike<TValue> = {
  name: string;
  state: {
    value: TValue;
    meta: FieldMetaLike;
  };
  handleChange: (value: TValue) => void;
  handleBlur: () => void;
};

export type ControlProps = {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
};

/**
 * The store always holds a verdict on every field; a field reports its own only once the user
 * has left it — or once a failed submit marked the whole step by the same blur flag.
 */
export function useFieldControl({ state }: FieldErrorState) {
  const id = useId();
  const errorId = `${id}-error`;
  const errors = state.meta.isBlurred ? state.meta.errors : [];
  const isInvalid = errors.length > 0;

  const control = {
    id,
    'aria-describedby': isInvalid ? errorId : undefined,
    'aria-invalid': isInvalid || undefined,
  };

  return { control, errorId, errors, isInvalid };
}

export function textControlProps(field: FieldLike<string>, control: ControlProps) {
  return {
    ...control,
    name: field.name,
    value: field.state.value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      field.handleChange(event.target.value),
    onBlur: field.handleBlur,
  };
}

export function toggleControlProps(field: FieldLike<boolean>, control: ControlProps) {
  return {
    ...control,
    name: field.name,
    checked: field.state.value,
    onCheckedChange: field.handleChange,
    onBlur: field.handleBlur,
  };
}
