import { act, fireEvent, render, screen } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppStateProvider, useAppContext } from '@/contexts/AppContext';

// Test component to use the context
const TestComponent = () => {
  const {
    isTerminal,
    isMenuDisplayed,
    lastKeyDown,
    oldKeyDown,
    setIsTerminal,
    setIsMenuDisplayed,
    setLastKeyDown,
    setOldKeyDown,
  } = useAppContext();

  const createMockKeyEvent = (key: string): KeyboardEvent =>
    ({
      key,
      code: key,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      repeat: false,
      timeStamp: Date.now(),
    }) as KeyboardEvent;

  return (
    <div>
      <div data-testid="is-terminal">{isTerminal ? 'true' : 'false'}</div>
      <div data-testid="is-menu-displayed">
        {isMenuDisplayed ? 'true' : 'false'}
      </div>
      <div data-testid="last-key">{lastKeyDown?.key || 'none'}</div>
      <div data-testid="old-key">{oldKeyDown?.key || 'none'}</div>
      <button
        type="button"
        data-testid="set-terminal-true"
        onClick={() => setIsTerminal(true)}
      >
        Set Terminal True
      </button>
      <button
        type="button"
        data-testid="set-terminal-false"
        onClick={() => setIsTerminal(false)}
      >
        Set Terminal False
      </button>
      <button
        type="button"
        data-testid="set-menu-displayed-true"
        onClick={() => setIsMenuDisplayed(true)}
      >
        Set Menu Displayed True
      </button>
      <button
        type="button"
        data-testid="set-menu-displayed-false"
        onClick={() => setIsMenuDisplayed(false)}
      >
        Set Menu Displayed False
      </button>
      <button
        type="button"
        data-testid="set-last-key"
        onClick={() => setLastKeyDown(createMockKeyEvent('Enter'))}
      >
        Set Last Key
      </button>
      <button
        type="button"
        data-testid="set-old-key"
        onClick={() => setOldKeyDown(lastKeyDown)}
      >
        Set Old Key
      </button>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide default values', () => {
    render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>,
    );

    expect(screen.getByTestId('is-terminal')).toHaveTextContent('false');
    expect(screen.getByTestId('is-menu-displayed')).toHaveTextContent('false');
    expect(screen.getByTestId('last-key')).toHaveTextContent('none');
    expect(screen.getByTestId('old-key')).toHaveTextContent('none');
  });

  it('should update isTerminal state', () => {
    render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>,
    );

    const setTrueButton = screen.getByTestId('set-terminal-true');
    const setFalseButton = screen.getByTestId('set-terminal-false');

    act(() => {
      fireEvent.click(setTrueButton);
    });

    expect(screen.getByTestId('is-terminal')).toHaveTextContent('true');

    act(() => {
      fireEvent.click(setFalseButton);
    });

    expect(screen.getByTestId('is-terminal')).toHaveTextContent('false');
  });

  it('should update lastKeyDown state', () => {
    render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>,
    );

    const setLastKeyButton = screen.getByTestId('set-last-key');

    act(() => {
      fireEvent.click(setLastKeyButton);
    });

    expect(screen.getByTestId('last-key')).toHaveTextContent('Enter');
  });

  it('should update oldKeyDown when setOldKeyDown is called', () => {
    render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>,
    );

    const setLastKeyButton = screen.getByTestId('set-last-key');
    const setOldKeyButton = screen.getByTestId('set-old-key');

    // First set a last key
    act(() => {
      fireEvent.click(setLastKeyButton);
    });

    expect(screen.getByTestId('last-key')).toHaveTextContent('Enter');

    // Then set it as old key
    act(() => {
      fireEvent.click(setOldKeyButton);
    });

    expect(screen.getByTestId('old-key')).toHaveTextContent('Enter');
  });

  it('should update isMenuDisplayed state', () => {
    render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>,
    );

    const setMenuTrueButton = screen.getByTestId('set-menu-displayed-true');
    const setMenuFalseButton = screen.getByTestId('set-menu-displayed-false');

    act(() => {
      fireEvent.click(setMenuTrueButton);
    });

    expect(screen.getByTestId('is-menu-displayed')).toHaveTextContent('true');

    act(() => {
      fireEvent.click(setMenuFalseButton);
    });

    expect(screen.getByTestId('is-menu-displayed')).toHaveTextContent('false');
  });
});
