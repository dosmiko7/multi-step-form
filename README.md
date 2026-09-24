# Multi Step Form — product catalogue

[![CI](https://github.com/dosmiko7/multi-step-form/actions/workflows/ci.yml/badge.svg)](https://github.com/dosmiko7/multi-step-form/actions/workflows/ci.yml)

A three-step product form inside a modal dialog, alongside a product list whose pagination lives
in the URL. The interface itself is in Polish, matching the brief and the supplied design.

Live demo: [multi-step-form-two-blond.vercel.app](https://multi-step-form-two-blond.vercel.app/)

## Getting started

```bash
pnpm install
pnpm dev
```

The app starts on [http://localhost:3000](http://localhost:3000).

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | development server       |
| `pnpm build`     | production build         |
| `pnpm start`     | run the production build |
| `pnpm test`      | Vitest + Testing Library |
| `pnpm typecheck` | `tsc --noEmit`           |
| `pnpm lint`      | ESLint                   |
| `pnpm format`    | Prettier, write          |

Requires Node 20+ and pnpm 10+.

## Stack

| Library                            | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| Next.js 16 (App Router) + React 19 | application shell                      |
| shadcn/ui on Base UI               | interface components                   |
| TanStack Form                      | form state and step handling           |
| Zod 4                              | validation schemas — one per step      |
| nuqs                               | table page number in the URL           |
| Tailwind CSS 4                     | styling, theme tokens as CSS variables |
| Vitest + Testing Library           | unit and component tests               |

## Documentation

| Document                                                             | Contents                                                          |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`src/features/products/README.md`](src/features/products/README.md) | how the products feature is laid out — layers and entry points    |
| [`docs/design-decisions.md`](docs/design-decisions.md)               | the decisions that shaped the implementation, with the reasoning  |
| [`docs/design-spec.md`](docs/design-spec.md)                         | values read from the `.fig` file — the implementation's reference |

## Structure

```
src/
  app/               Next.js routes, theme tokens
  components/ui/     shadcn-generated components
  features/          domain code, one directory per feature
  testing/           Vitest setup
```

## Tests

```bash
pnpm test
```

Unit tests cover the price arithmetic — including the cases where a floating-point
implementation drifts away from whole grosze — and amount formatting. Component tests walk
through the dialog the way a reviewer would: a step blocked by errors, stepping back without
losing data, price recalculation in both directions, the stock field appearing and clearing with
its checkbox, an inverted cart range, saving a product, and the reset after closing.

## Deployment

_Link to be added once deployed._
