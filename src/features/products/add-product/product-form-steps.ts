export const PRODUCT_FORM_STEPS = [
  { key: 'basics', title: 'Informacje', subtitle: 'Dane podstawowe' },
  { key: 'pricing', title: 'Cena', subtitle: 'Dane cenowe' },
  { key: 'availability', title: 'Dostępność', subtitle: 'Stany magazynowe' },
] as const;

export type ProductFormStepKey = (typeof PRODUCT_FORM_STEPS)[number]['key'];

export const LAST_STEP_INDEX = PRODUCT_FORM_STEPS.length - 1;
