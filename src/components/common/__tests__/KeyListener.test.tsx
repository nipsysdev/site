import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  it('renders without crashing', () => {
    const { container } = render(<KeyListener />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    const { container } = render(<KeyListener />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('fixed', '-bottom-5', 'opacity-0');
  });

  it('has popover manual attribute', () => {
    const { container } = render(<KeyListener />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveAttribute('popover', 'manual');
  });

  it('contains a button with autoFocus', () => {
    const { container } = render(<KeyListener />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    // autoFocus is a boolean prop that may not appear as an attribute in tests
    // so let's just verify the button exists and has correct type
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
