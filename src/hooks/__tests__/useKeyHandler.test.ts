import { renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useKeyHandler from '@/hooks/useKeyHandler';

// Mock the AppContext
const mockSetOldKeyDown = vi.fn();
const mockUseAppContext = vi.fn();

vi.mock('@/contexts/AppContext', () => ({
  useAppContext: () => mockUseAppContext(),
}));

const createMockKeyboardEvent = (
  key: string,
  timeStamp: number,
): KeyboardEvent =>
  ({
    key,
    timeStamp,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    repeat: false,
    type: 'keydown',
    bubbles: true,
    cancelable: true,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as KeyboardEvent;

describe('useKeyHandler', () => {
  const mockHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call handler when new key event occurs', () => {
    const keyEvent = createMockKeyboardEvent('Enter', 123456);

    mockUseAppContext.mockReturnValue({
      lastKeyDown: keyEvent,
      oldKeyDown: null,
      setOldKeyDown: mockSetOldKeyDown,
    });

    renderHook(() => useKeyHandler(mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(keyEvent);
    expect(mockSetOldKeyDown).toHaveBeenCalledWith(keyEvent);
  });

  it('should not call handler when deactivated', () => {
    const keyEvent = createMockKeyboardEvent('Enter', 123456);

    mockUseAppContext.mockReturnValue({
      lastKeyDown: keyEvent,
      oldKeyDown: null,
      setOldKeyDown: mockSetOldKeyDown,
    });

    renderHook(() => useKeyHandler(mockHandler, true));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldKeyDown).not.toHaveBeenCalled();
  });

  it('should not call handler when no new key event', () => {
    mockUseAppContext.mockReturnValue({
      lastKeyDown: null,
      oldKeyDown: null,
      setOldKeyDown: mockSetOldKeyDown,
    });

    renderHook(() => useKeyHandler(mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldKeyDown).not.toHaveBeenCalled();
  });

  it('should not call handler when key event is not new', () => {
    const keyEvent = createMockKeyboardEvent('Enter', 123456);

    mockUseAppContext.mockReturnValue({
      lastKeyDown: keyEvent,
      oldKeyDown: keyEvent, // Same event
      setOldKeyDown: mockSetOldKeyDown,
    });

    renderHook(() => useKeyHandler(mockHandler));

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockSetOldKeyDown).not.toHaveBeenCalled();
  });
});
