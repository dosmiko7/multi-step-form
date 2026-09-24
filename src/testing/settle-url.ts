import { act } from '@testing-library/react';

/** nuqs writes the URL on a timer, so a correction that is coming has landed by now. */
export const settleUrl = () => act(() => new Promise((resolve) => setTimeout(resolve, 100)));
