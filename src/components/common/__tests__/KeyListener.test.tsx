import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KeyListener } from '../KeyListener';

// Mock the AppContext
const mockSetLastKeyDown = vi.fn();
vi.mock('@/contexts/AppContext', () => ({
  useAppContext: () => ({
    setLastKeyDown: mockSetLastKeyDown,
  }),
}));

describe('KeyListener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setLastKeyDown on keyDown event', () => {
    const { container } = render(<KeyListener />);
    const button = container.querySelector('button') as HTMLButtonElement;

    const keyDownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    fireEvent.keyDown(button, keyDownEvent);

    expect(mockSetLastKeyDown).toHaveBeenCalledWith(expect.any(Object));
  });

  it('refocuses button on blur', () => {
    const { container } = render(<KeyListener />);
    const button = container.querySelector('button') as HTMLButtonElement;

    const focusSpy = vi.spyOn(button, 'focus');
    fireEvent.blur(button);

    expect(focusSpy).toHaveBeenCalled();
  });
});
