<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working here

Read before writing code:

- [`src/features/products/README.md`](src/features/products/README.md) — the feature's layout, dependency direction and conventions; the direction is ESLint-enforced.
- [`docs/design-decisions.md`](docs/design-decisions.md) — the reasoning behind the implementation; changing a described behaviour means updating its entry.
- [`docs/design-spec.md`](docs/design-spec.md) — tokens and measurements from the `.fig` file; visual work traces back here.

Conventions the tooling does not enforce:

- Where the design and the brief disagree, the brief is the contract.
- UI copy, validation messages and seed data are Polish; code and docs are English.
- Conventional Commits (`type(scope): description`); one topic per branch, merged through a PR with green CI.
