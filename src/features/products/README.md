# Products

The product catalogue and the three-step form for adding a new product. The whole domain lives in
this directory: two halves, and the small kernel they share.

## Layout

```
src/features/products/
  product-list/   the catalogue — table, mobile cards, pagination, formatting
  add-product/    the dialog — form assembly, stepper
    form/         the form's logic — schemas, form hook, net ⇄ gross, step focus
    fields/       field wrappers over the shared UI controls
    steps/        the three screens
  domain/         product                  the type, the vocabularies it is made of, the factory
  api/            get-products             catalogue data source (a mock stands in for a backend)
  stores/         products-store           the catalogue: seed plus added products (React context)
                  added-products-storage   added products in localStorage, for useSyncExternalStore
  hooks/          use-products-page        page number in the URL, plus the visible slice
```

## Dependency direction

Each half depends on the kernel — `domain/`, `api/`, `stores/`, `hooks/` — and never on the other
half's internals. The one edge between them is the list rendering `AddProductDialog`.

That direction is enforced, not just described: the `import/no-restricted-paths` zones in
`eslint.config.mjs` reject a list file importing anything from `add-product/` other than the
dialog, a form file importing from `product-list/`, and a kernel file importing from either half.

A file belongs in the kernel only when both halves read it. Everything else lives next to its
only reader, with its tests beside it. Why the split runs this way is recorded in
[`docs/design-decisions.md`](../../../docs/design-decisions.md), "Where a file lives".

## Entry points

| File                                      | Role                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `stores/products-store.tsx`               | `ProductsProvider` — holds the catalogue, mounted in `app/page.tsx`  |
| `product-list/product-list.tsx`           | header with the count, the add button, and the list under `Suspense` |
| `add-product/add-product-dialog.tsx`      | the modal; the form itself is loaded lazily                          |
| `add-product/form/product-form-schema.ts` | Zod schemas — one per step, plus one for the whole form              |

## Conventions

Imports into the kernel or across features are absolute (`@/features/products/...`); imports
within a half are relative (`./product-columns`, `../form/pricing`), which keeps each half
readable as one unit and movable as one. The same `import/no-restricted-paths` rule also keeps
shared components from reaching into features or routes.

Text is converted to numbers in the schema, at the form boundary — past that point, in the store
and in the list, a product is fully typed.

UI copy, validation messages and seed data are in Polish: that is the product's language, taken
from the brief and the design.

The reasoning behind these choices lives in
[`docs/design-decisions.md`](../../../docs/design-decisions.md).
