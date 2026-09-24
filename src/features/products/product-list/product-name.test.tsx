import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductName } from './product-name';

const NAME = 'Bosch Serie 6 WAU28P40 pralka ładowana od frontu, 9 kg, 1400 obr./min';

/** jsdom has no layout, so the clamp is simulated by the heights it would produce. */
function simulateRenderedLines(lines: number) {
  const LINE_HEIGHT = 21;
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(lines * LINE_HEIGHT);
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(
    Math.min(lines, 2) * LINE_HEIGHT,
  );
}

async function hoverName() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<ProductName name={NAME} />);

  await user.hover(screen.getByText(NAME));
  await act(() => vi.advanceTimersByTimeAsync(1000));
}

const tooltip = () => document.querySelector('[data-slot="tooltip-content"]');

describe('ProductName', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the whole name in a tooltip when the clamp cuts it off', async () => {
    simulateRenderedLines(3);

    await hoverName();

    expect(tooltip()).toHaveTextContent(NAME);
  });

  it('shows no tooltip when the name fits', async () => {
    simulateRenderedLines(2);

    await hoverName();

    expect(tooltip()).not.toBeInTheDocument();
  });
});
