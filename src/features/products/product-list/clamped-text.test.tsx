import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClampedText } from './clamped-text';

const TEXT = 'Bosch Serie 6 WAU28P40 pralka ładowana od frontu, 9 kg, 1400 obr./min';

/** jsdom has no layout, so overflow is simulated through the sizes layout would produce. */
function simulateOverflow({ x = false, y = false }: { x?: boolean; y?: boolean }) {
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(y ? 63 : 42);
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(42);
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(x ? 300 : 240);
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(240);
}

async function hoverText() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<ClampedText text={TEXT} className="line-clamp-2" />);

  await user.hover(screen.getByText(TEXT));
  await act(() => vi.advanceTimersByTimeAsync(1000));
}

const tooltip = () => document.querySelector('[data-slot="tooltip-content"]');

describe('ClampedText', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the whole text in a tooltip when a multi-line clamp cuts it off', async () => {
    simulateOverflow({ y: true });

    await hoverText();

    expect(tooltip()).toHaveTextContent(TEXT);
  });

  it('shows the whole text in a tooltip when one-line truncation cuts it off', async () => {
    simulateOverflow({ x: true });

    await hoverText();

    expect(tooltip()).toHaveTextContent(TEXT);
  });

  it('shows no tooltip when the text fits', async () => {
    simulateOverflow({});

    await hoverText();

    expect(tooltip()).not.toBeInTheDocument();
  });
});
