import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

/** The browser's path: the server's HTML first, then React hydrating it. */
export function renderHydrated(ui: ReactElement) {
  const serverHtml = renderToString(ui);
  const container = document.createElement('div');
  container.innerHTML = serverHtml;
  document.body.append(container);

  return { serverHtml, ...render(ui, { container, hydrate: true }) };
}
