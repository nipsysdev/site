import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCommandEntry } from '@/__tests__/fixtures/terminal-fixtures';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import { $isAppReady } from '@/stores/app-store';
import {
  $terminalHistory,
  $terminalHistoryVisibleIdx,
  $terminalPromptRef,
} from '@/stores/terminal-store';
import type { CommandEntry } from '@/types/terminal';
import { Command } from '@/types/terminal';

vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => store.get()),
}));

vi.mock('@/stores/terminal-store', () => ({
  $terminalHistory: {
    get: vi.fn(() => []),
  },
  $terminalHistoryVisibleIdx: {
    get: vi.fn(() => 0),
  },
  $terminalPromptRef: {
    set: vi.fn(),
  },
  initializeTerminal: vi.fn(),
}));

vi.mock('@/stores/app-store', () => ({
  $isAppReady: {
    get: vi.fn(() => true),
  },
}));

vi.mock('@/stores/repo-store', () => ({
  $repoTree: {
    listen: vi.fn(() => () => {}),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('@/components/terminal/TerminalPrompt', () => ({
  default: vi.fn(({ entry, i18n }) => {
    const input = entry ? entry.cmdName : 'test-input';
    return (
      <div data-testid="terminal-prompt" data-entry={entry ? 'true' : 'false'}>
        <span>{i18n('visitor')}@localhost:~$</span>
        <input type="text" defaultValue={input} data-readonly={!!entry} />
      </div>
    );
  }),
}));

vi.mock('@/components/cmd-outputs/UnknownCmdOutput', () => ({
  default: vi.fn(({ cmdName }) => (
    <div data-testid="unknown-cmd-output">Unknown command: {cmdName}</div>
  )),
}));

describe('TerminalEmulator', () => {
  const mockHistoryGet = vi.mocked($terminalHistory.get);
  const mockHistoryVisibleIdxGet = vi.mocked($terminalHistoryVisibleIdx.get);
  const mockPromptRefSet = vi.mocked($terminalPromptRef.set);
  const mockIsAppReadyGet = vi.mocked($isAppReady.get);

  beforeEach(() => {
    vi.clearAllMocks();
    mockHistoryGet.mockReturnValue([]);
    mockHistoryVisibleIdxGet.mockReturnValue(0);
    mockIsAppReadyGet.mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing on server side (no window)', () => {
      render(<TerminalEmulator />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders terminal container after hydration', () => {
      render(<TerminalEmulator />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders main prompt', () => {
      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('renders history entries', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({ cmdName: Command.Help, timestamp: 1000 }),
        buildCommandEntry({ cmdName: Command.Whoami, timestamp: 2000 }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      expect(prompts).toHaveLength(3);
    });

    it('respects historyVisibleIdx to slice history', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({ cmdName: Command.Help, timestamp: 1000 }),
        buildCommandEntry({ cmdName: Command.Whoami, timestamp: 2000 }),
        buildCommandEntry({ cmdName: Command.Contact, timestamp: 3000 }),
      ];
      mockHistoryGet.mockReturnValue(entries);
      mockHistoryVisibleIdxGet.mockReturnValue(1);

      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      expect(prompts).toHaveLength(3);
    });
  });

  describe('command outputs', () => {
    it('renders output component when entry has output', () => {
      const MockOutput = vi.fn(({ entry }) => (
        <div data-testid="mock-output">Output for {entry.cmdName}</div>
      ));
      const entries: CommandEntry[] = [
        buildCommandEntry({
          cmdName: Command.Help,
          output: MockOutput,
          timestamp: 1000,
        }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(screen.getByTestId('mock-output')).toBeInTheDocument();
    });

    it('renders UnknownCmdOutput when entry has an unrecognized cmdName and no output', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({
          cmdName: 'foobar' as Command,
          output: undefined,
          timestamp: 1000,
        }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(screen.getByTestId('unknown-cmd-output')).toBeInTheDocument();
    });

    it('renders the entry error text and no UnknownCmdOutput when entry has an error', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({
          cmdName: Command.Clear,
          output: undefined,
          error: 'boom',
          timestamp: 1000,
        }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(screen.getByText('boom')).toBeInTheDocument();
      expect(
        screen.queryByTestId('unknown-cmd-output'),
      ).not.toBeInTheDocument();
    });

    it('renders nothing for a recognized command with no output and no error', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({
          cmdName: Command.Clear,
          output: undefined,
          timestamp: 1000,
        }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(
        screen.queryByTestId('unknown-cmd-output'),
      ).not.toBeInTheDocument();
    });

    it('does not render output when entry has no cmdName', () => {
      const entries: CommandEntry[] = [
        {
          timestamp: 1000,
          cmdName: undefined as unknown as Command,
          args: { positional: [], flags: [], options: {} },
          rawInput: '',
        },
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(
        screen.queryByTestId('unknown-cmd-output'),
      ).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls focus on the prompt ref when container is clicked', async () => {
      vi.useFakeTimers();
      render(<TerminalEmulator />);
      const container = screen.getByRole('button');

      vi.advanceTimersByTime(100);
      expect(mockPromptRefSet).toHaveBeenCalled();

      fireEvent.click(container);
      expect(container).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('handles keyboard events on container', () => {
      render(<TerminalEmulator />);
      const container = screen.getByRole('button');

      container.focus();
      expect(container).toHaveFocus();

      fireEvent.keyDown(container, { key: 'Enter' });
      fireEvent.keyDown(container, { key: 'Tab' });

      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('tabIndex', '0');
    });

    it('does not swallow Space typed in the prompt input (regression)', () => {
      render(<TerminalEmulator />);
      // The stubbed main prompt renders an input with defaultValue 'test-input'.
      const input = screen.getByDisplayValue('test-input');

      // Dispatch a real keydown so it bubbles to the real TerminalEmulator
      // container handler. Without the `target === currentTarget` guard, the
      // container's preventDefault() deletes the Space character, making it
      // impossible to type args like `cat README.md`.
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('store integration', () => {
    it('sets prompt ref on mount', () => {
      vi.useFakeTimers();
      render(<TerminalEmulator />);

      vi.advanceTimersByTime(100);
      expect(mockPromptRefSet).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('uses history from store', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({ cmdName: Command.Help, timestamp: 1000 }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(screen.getAllByTestId('terminal-prompt').length).toBeGreaterThan(
        1,
      );
    });

    it('uses historyVisibleIdx from store', () => {
      mockHistoryVisibleIdxGet.mockReturnValue(5);
      render(<TerminalEmulator />);
      expect(mockHistoryVisibleIdxGet).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has button role on container', () => {
      render(<TerminalEmulator />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has tabIndex on container', () => {
      render(<TerminalEmulator />);
      const container = screen.getByRole('button');
      expect(container).toHaveAttribute('tabIndex', '0');
    });
  });
});
