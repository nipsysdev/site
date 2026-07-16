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
  getDisplayHost: vi.fn(() => 'localhost'),
  getTerminalEntryInput: vi.fn((entry) => entry.cmdName),
}));

import type { Translator } from '@/i18n/intl';
import { $cwd } from '@/stores/repo-store';
import {
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

  const mockI18n = ((key: string) => {
    const translations: Record<string, string> = {
      visitor: 'visitor',
      noMatch: 'No match found',
    };
    return translations[key] ?? key;
  }) as Translator;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInputGet.mockReturnValue('');
    mockReadOnlyGet.mockReturnValue(false);
    mockSuggestionsGet.mockReturnValue(null);
    $cwd.set('/');
  });

  afterEach(() => {
    vi.resetAllMocks();
    $cwd.set('/');
  });

  describe('rendering', () => {
    it('renders the prompt with visitor and host', () => {
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.getByText(/visitor@localhost:\/\$/)).toBeInTheDocument();
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

  describe('prompt path from cwd', () => {
    it('renders the live cwd in the prompt', () => {
      $cwd.set('/src');
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.getByText(/visitor@localhost:\/src\$/)).toBeInTheDocument();
    });

    it('uses the entry snapshot cwd when an entry is provided', () => {
      const entry: CommandEntry = {
        timestamp: Date.now(),
        cmdName: Command.Help,
        args: { positional: [], flags: [], options: {} },
        rawInput: 'help',
        cwd: '/src/app',
      };
      $cwd.set('/');
      render(<TerminalPrompt i18n={mockI18n} entry={entry} />);
      expect(
        screen.getByText(/visitor@localhost:\/src\/app\$/),
      ).toBeInTheDocument();
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
      mockSuggestionsGet.mockReturnValue(['help', 'whoami', 'clear']);
      render(<TerminalPrompt i18n={mockI18n} />);
      expect(screen.getByText('help')).toBeInTheDocument();
      expect(screen.getByText('whoami')).toBeInTheDocument();
      expect(screen.getByText('clear')).toBeInTheDocument();
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

  describe('ref methods', () => {
    it('exposes focus method', async () => {
      const ref = createRef<TerminalPromptRef>();
      render(<TerminalPrompt i18n={mockI18n} ref={ref} />);

      const input = screen.getByRole('textbox');
      const focusSpy = vi.spyOn(input, 'focus');

      ref.current?.focus();
      expect(focusSpy).toHaveBeenCalled();
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
