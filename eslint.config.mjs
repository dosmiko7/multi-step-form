import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';

const PRODUCTS = './src/features/products';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // The unidirectional layering from bulletproof-react: shared code must not reach
            // into a feature or into the routes, and a feature must not reach into the routes.
            { target: PRODUCTS, from: './src/app' },
            {
              target: './src/components',
              from: './src/features',
              message: 'Shared components cannot depend on a feature.',
            },
            {
              target: './src/components',
              from: './src/app',
              message: 'Shared components cannot depend on the routes.',
            },
            // Inside the feature: each half reads the kernel and never the other half. The one
            // edge between them is the list mounting the dialog. See the feature README.
            {
              target: `${PRODUCTS}/product-list`,
              from: `${PRODUCTS}/add-product`,
              except: ['./add-product-dialog.tsx'],
              message: 'The list reaches the form only through AddProductDialog.',
            },
            {
              target: `${PRODUCTS}/add-product`,
              from: `${PRODUCTS}/product-list`,
              message: 'The form does not depend on the list.',
            },
            {
              target: [
                `${PRODUCTS}/api`,
                `${PRODUCTS}/domain`,
                `${PRODUCTS}/hooks`,
                `${PRODUCTS}/stores`,
              ],
              from: [`${PRODUCTS}/add-product`, `${PRODUCTS}/product-list`],
              message: 'The kernel is read by both halves and reads neither.',
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
