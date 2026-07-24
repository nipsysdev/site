import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TerminalPrompt, {
  type TerminalPromptRef,
} from '@/components/terminal/TerminalPrompt';
import type { CommandEntry } from '@/types/terminal';
import { Command } from '@/types/terminal';

vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => store.get()),
}));

vi.mock('@/stores/terminal-store', () => ({
  $terminalInput: {
    get: vi.fn(() => ''),
    set: vi.fn(),
  },
  $terminalInputReadOnly: {
    get: vi.fn(() => false),
  },
  $lastDisplayedCommand: {
    get: vi.fn(() => ''),
    set: vi.fn(),
  },
  $terminalHistoryIdx: {
    get: vi.fn(() => -1),
    set: vi.fn(),
  },
  $terminalKeyEvent: {
    set: vi.fn(),
  },
  $terminalSuggestions: {
    get: vi.fn(() => null),
  },
}));

vi.mock('@/utils/terminal-utils', () => ({
  getTerminalEntryInput: vi.fn((entry) => entry.cmdName),
}));

import type { Translator } from '@/i18n/intl';
import {
  $lastDisplayedCommand,
  $terminalInput,
  $terminalInputReadOnly,
  $terminalKeyEvent,
  $terminalSuggestions,
} from '@/stores/terminal-store';

describe('TerminalPrompt', () => {
  const mockInputGet = vi.mocked($terminalInput.get);
  const mockInputSet = vi.mocked($terminalInput.set);
  const mockReadOnlyGet = vi.mocked($terminalInputReadOnly.get);
  const mockKeyEventSet = vi.mocked($terminalKeyEvent.set);
  const mockSuggestionsGet = vi.mocked($terminalSuggestions.get);
  const mockLastDisplayedGet = vi.mocked($lastDisplayedCommand.get);
  const mockLastDisplayedSet = vi.mocked($lastDisplayedCommand.set);

  const mockI18n = ((key: string) => {
    const translations: Record<string, string> = {
      noMatch: 'No match found',
    };
    return translations[key] ?? key;
  }) as Translator;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInputGet.mockReturnValue('');
    mockReadOnlyGet.mockReturnValue(false);
    mockSuggestionsGet.mockReturnValue(null);
    mockLastDisplayedGet.mockReturnValue('');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders the $ prefix glyph', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('does not render the old visitor@host:path prefix', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.queryByText(/visitor@localhost/)).not.toBeInTheDocument();
    });

    it('renders an input field', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays current input value from store', () => {
      mockInputGet.mockReturnValue('help');
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('help');
    });

    it('renders entry input when entry is provided', () => {
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Help,
        args: { positional: [], flags: [], options: {} },
        rawInput: 'help',
      };
      render(<TerminalPrompt i18n={mockI18n} entry={entry} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('help');
    });

    it('input is read-only when entry is provided', () => {
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Help,
        args: { positional: [], flags: [], options: {} },
        rawInput: 'help',
      };
      render(<TerminalPrompt i18n={mockI18n} entry={entry} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('input is read-only when store says read-only', () => {
      mockReadOnlyGet.mockReturnValue(true);
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('block cursor', () => {
    it('renders hollow cursor when unfocused', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      const cursor = document.querySelector('.prompt-cursor');
      expect(cursor).toBeInTheDocument();
      expect(cursor).toHaveClass('prompt-cursor--hollow');
    });

    it('renders solid+blinking cursor when focused and idle', () => {
      vi.useFakeTimers();
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Wait past the typing timer (400ms) so isTyping settles to false.
      vi.advanceTimersByTime(500);

      const cursor = document.querySelector('.prompt-cursor');
      expect(cursor).toBeInTheDocument();
      expect(cursor).not.toHaveClass('prompt-cursor--solid');
      expect(cursor).not.toHaveClass('prompt-cursor--hollow');
      vi.useRealTimers();
    });

    it('transitions from hollow to solid on focus', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      const cursorBefore = document.querySelector('.prompt-cursor');
      expect(cursorBefore).toHaveClass('prompt-cursor--hollow');

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      const cursorAfter = document.querySelector('.prompt-cursor');
      expect(cursorAfter).toBeInTheDocument();
      expect(cursorAfter).not.toHaveClass('prompt-cursor--hollow');
    });

    it('does not render the block cursor for entry echoes', () => {
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Help,
        args: { positional: [], flags: [], options: {} },
        rawInput: 'help',
      };
      render(<TerminalPrompt i18n={mockI18n} entry={entry} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(document.querySelector('.prompt-cursor')).not.toBeInTheDocument();
    });
  });

  describe('suggestions', () => {
    it('does not show suggestions when null', () => {
      mockSuggestionsGet.mockReturnValue(null);
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.queryByText('No match found')).not.toBeInTheDocument();
    });

    it('shows "no match" when suggestions is empty array', () => {
      mockSuggestionsGet.mockReturnValue([]);
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.getByText('No match found')).toBeInTheDocument();
    });

    it('shows suggestions list when suggestions exist', () => {
      mockSuggestionsGet.mockReturnValue(['help', 'whoami', 'contact']);
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.getByText('help')).toBeInTheDocument();
      expect(screen.getByText('whoami')).toBeInTheDocument();
      expect(screen.getByText('contact')).toBeInTheDocument();
    });

    it('does not show suggestions when entry is provided', () => {
      mockSuggestionsGet.mockReturnValue(['help', 'whoami']);
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Help,
        args: { positional: [], flags: [], options: {} },
        rawInput: 'help',
      };
      render(<TerminalPrompt i18n={mockI18n} entry={entry} />);
      expect(screen.queryByText('help')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('updates store on input change', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'whoami' } });
      expect(mockInputSet).toHaveBeenCalledWith('whoami');
    });

    it('sets key event on keydown', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockKeyEventSet).toHaveBeenCalled();
    });
  });

  describe('focus-clears-input behavior (single-prompt model)', () => {
    it('clears the input store on focus when not read-only', () => {
      mockInputGet.mockReturnValue('existing');
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');

      mockInputSet.mockClear();
      fireEvent.focus(input);

      expect(mockInputSet).toHaveBeenCalledWith('');
    });

    it('does NOT clear the input store on focus when read-only', () => {
      mockReadOnlyGet.mockReturnValue(true);
      mockInputGet.mockReturnValue('welcome');
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');

      mockInputSet.mockClear();
      fireEvent.focus(input);

      expect(mockInputSet).not.toHaveBeenCalledWith('');
    });

    it('captures the current displayed value into $lastDisplayedCommand on focus', () => {
      mockInputGet.mockReturnValue('welcome');
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');

      mockLastDisplayedSet.mockClear();
      mockInputSet.mockClear();
      fireEvent.focus(input);

      expect(mockLastDisplayedSet).toHaveBeenCalledWith('welcome');
      expect(mockInputSet).toHaveBeenCalledWith('');
    });

    it('does NOT touch $lastDisplayedCommand on focus when read-only', () => {
      mockReadOnlyGet.mockReturnValue(true);
      mockInputGet.mockReturnValue('welcome');
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');

      mockLastDisplayedSet.mockClear();
      fireEvent.focus(input);

      expect(mockLastDisplayedSet).not.toHaveBeenCalled();
    });

    it('restores $terminalInput from $lastDisplayedCommand on blur (no submit)', () => {
      mockLastDisplayedGet.mockReturnValue('welcome');
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');

      mockInputSet.mockClear();
      fireEvent.blur(input);

      expect(mockInputSet).toHaveBeenCalledWith('welcome');
    });

    it('restore-on-blur is a no-op when $lastDisplayedCommand holds the just-submitted value', () => {
      // After submit, $terminalInput === $lastDisplayedCommand === 'whoami'.
      mockInputGet.mockReturnValue('whoami');
      mockLastDisplayedGet.mockReturnValue('whoami');
      render(<TerminalPrompt i18n={mockI18n} />);
      const input = screen.getByRole('textbox');

      mockInputSet.mockClear();
      fireEvent.blur(input);

      // Restore writes the same value back — single call, same value.
      expect(mockInputSet).toHaveBeenCalledWith('whoami');
    });
  });

  describe('ref methods', () => {
    it('exposes focus method', async () => {
      const ref = createRef<TerminalPromptRef>();
      render(<TerminalPrompt i18n={mockI18n} ref={ref} />);

      const input = screen.getByRole('textbox');
      const focusSpy = vi.spyOn(input, 'focus');

      ref.current?.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('exposes blur method', async () => {
      const ref = createRef<TerminalPromptRef>();
      render(<TerminalPrompt i18n={mockI18n} ref={ref} />);

      const input = screen.getByRole('textbox');
      const blurSpy = vi.spyOn(input, 'blur');

      ref.current?.blur();
      expect(blurSpy).toHaveBeenCalled();
    });

    it('exposes scrollIntoView method', async () => {
      const ref = createRef<TerminalPromptRef>();
      render(<TerminalPrompt i18n={mockI18n} ref={ref} />);

      const input = screen.getByRole('textbox');
      const scrollSpy = vi.spyOn(input, 'scrollIntoView');

      ref.current?.scrollIntoView();
      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('exposes setCursorToIdx method', async () => {
      vi.useFakeTimers();

      mockInputGet.mockReturnValue('help --format=json');

      const ref = createRef<TerminalPromptRef>();
      render(<TerminalPrompt i18n={mockI18n} ref={ref} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      expect(input.value).toBe('help --format=json');

      ref.current?.setCursorToIdx(5);

      await vi.advanceTimersByTimeAsync(20);

      expect(input.selectionStart).toBe(5);
      expect(input.selectionEnd).toBe(5);

      vi.useRealTimers();
    });
  });
});
