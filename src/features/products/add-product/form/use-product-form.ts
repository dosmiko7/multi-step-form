'use client';

import { useForm, type ValidationLogicFn } from '@tanstack/react-form';

import { createProduct, type Product } from '@/features/products/domain/product';

import {
  PRODUCT_FORM_DEFAULTS,
  productFormSchema,
  type ProductFormOutput,
} from './product-form-schema';

/**
 * Runs the step schema on every change, blur and submit, so the store always holds a verdict on
 * every field; whether a field may report it is decided per field in `useFieldControl`. No stock
 * strategy covers all three events: `revalidateLogic` skips either change or blur until the step
 * has been submitted.
 */
const validateOnEveryEdit: ValidationLogicFn = (props) => {
  const { type, async } = props.event;
  const isEdit = type === 'change' || type === 'blur' || type === 'submit';

  const validators =
    isEdit && props.validators
      ? [
          {
            fn: async ? props.validators.onDynamicAsync : props.validators.onDynamic,
            cause: 'dynamic' as const,
          },
        ]
      : [];

  return props.runValidation({ validators, form: props.form });
};

function toProduct({ basics, pricing, availability }: ProductFormOutput): Product {
  return createProduct({
    name: basics.name,
    sku: basics.sku,
    description: basics.description === '' ? undefined : basics.description,
    manufacturer: basics.manufacturer,
    category: basics.category,
    features: basics.features,
    netPrice: pricing.netPrice,
    grossPrice: pricing.grossPrice,
    vatRate: pricing.vatRate,
    currency: pricing.currency,
    isAvailable: availability.isAvailable,
    minCartQuantity: availability.minCartQuantity,
    maxCartQuantity: availability.maxCartQuantity,
    ...(availability.isLimited
      ? { isLimited: true, stockQuantity: availability.stockQuantity }
      : { isLimited: false }),
  });
}

export function useProductForm(onCreated: (product: Product) => void) {
  return useForm({
    defaultValues: PRODUCT_FORM_DEFAULTS,
    validationLogic: validateOnEveryEdit,
    onSubmit: ({ value }) => {
      onCreated(toProduct(productFormSchema.parse(value)));
    },
  });
}

export type ProductFormApi = ReturnType<typeof useProductForm>;
