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
  }) as KeyboardEvent;

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

  it('should call handler when key event has different key', () => {
    const oldKeyEvent = createMockKeyboardEvent('Enter', 123456);
    const newKeyEvent = createMockKeyboardEvent('Escape', 123456);

    mockUseAppContext.mockReturnValue({
      lastKeyDown: newKeyEvent,
      oldKeyDown: oldKeyEvent,
      setOldKeyDown: mockSetOldKeyDown,
    });

    renderHook(() => useKeyHandler(mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(newKeyEvent);
    expect(mockSetOldKeyDown).toHaveBeenCalledWith(newKeyEvent);
  });

  it('should call handler when key event has different timestamp', () => {
    const oldKeyEvent = createMockKeyboardEvent('Enter', 123456);
    const newKeyEvent = createMockKeyboardEvent('Enter', 789012);

    mockUseAppContext.mockReturnValue({
      lastKeyDown: newKeyEvent,
      oldKeyDown: oldKeyEvent,
      setOldKeyDown: mockSetOldKeyDown,
    });

    renderHook(() => useKeyHandler(mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(newKeyEvent);
    expect(mockSetOldKeyDown).toHaveBeenCalledWith(newKeyEvent);
  });

  it('should handle multiple key events correctly', () => {
    const keyEvent1 = createMockKeyboardEvent('Enter', 123456);
    const keyEvent2 = createMockKeyboardEvent('Escape', 789012);

    // First render with first key event
    mockUseAppContext.mockReturnValue({
      lastKeyDown: keyEvent1,
      oldKeyDown: null,
      setOldKeyDown: mockSetOldKeyDown,
    });

    const { rerender } = renderHook(() => useKeyHandler(mockHandler));

    expect(mockHandler).toHaveBeenCalledWith(keyEvent1);
    expect(mockSetOldKeyDown).toHaveBeenCalledWith(keyEvent1);

    // Clear mocks and set up for second key event
    vi.clearAllMocks();

    mockUseAppContext.mockReturnValue({
      lastKeyDown: keyEvent2,
      oldKeyDown: keyEvent1,
      setOldKeyDown: mockSetOldKeyDown,
    });

    rerender();

    expect(mockHandler).toHaveBeenCalledWith(keyEvent2);
    expect(mockSetOldKeyDown).toHaveBeenCalledWith(keyEvent2);
  });

  it('should handle activation/deactivation correctly', () => {
    const keyEvent = createMockKeyboardEvent('Enter', 123456);

    mockUseAppContext.mockReturnValue({
      lastKeyDown: keyEvent,
      oldKeyDown: null,
      setOldKeyDown: mockSetOldKeyDown,
    });

    const { rerender } = renderHook(
      ({ deactivated }) => useKeyHandler(mockHandler, deactivated),
      { initialProps: { deactivated: true } },
    );

    // Should not call handler when deactivated
    expect(mockHandler).not.toHaveBeenCalled();

    // Activate and rerender
    rerender({ deactivated: false });

    expect(mockHandler).toHaveBeenCalledWith(keyEvent);
  });
});
