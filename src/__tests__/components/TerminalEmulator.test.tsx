import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCommandEntry } from '@/__tests__/fixtures/terminal-fixtures';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import { $isAppReady } from '@/stores/app-store';
import { $terminalHistory, $terminalPromptRef } from '@/stores/terminal-store';
import type { CommandEntry } from '@/types/terminal';
import { Command } from '@/types/terminal';

vi.mock('@nanostores/react', () => ({
  useStore: vi.fn((store) => store.get()),
}));

vi.mock('@/stores/terminal-store', () => ({
  $terminalHistory: {
    get: vi.fn(() => []),
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
  default: vi.fn(({ entry }) => {
    const input = entry ? entry.cmdName : 'test-input';
    return (
      <div data-testid="terminal-prompt" data-entry={entry ? 'true' : 'false'}>
        <span>$</span>
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
  const mockPromptRefSet = vi.mocked($terminalPromptRef.set);
  const mockIsAppReadyGet = vi.mocked($isAppReady.get);

  beforeEach(() => {
    vi.clearAllMocks();
    mockHistoryGet.mockReturnValue([]);
    mockIsAppReadyGet.mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders terminal container after hydration', () => {
      render(<TerminalEmulator />);
      expect(screen.getByTestId('terminal-prompt')).toBeInTheDocument();
    });

    it('renders main prompt', () => {
      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('renders only the editable prompt when history is empty', () => {
      mockHistoryGet.mockReturnValue([]);

      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      // No history → only the editable main prompt.
      expect(prompts).toHaveLength(1);
    });

    it('renders only the editable prompt regardless of history (single-prompt model)', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({ cmdName: Command.Help, timestamp: 1000 }),
        buildCommandEntry({ cmdName: Command.Whoami, timestamp: 2000 }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      // Single-prompt model: editable main prompt doubles as the display.
      // The read-only echo prompt was removed; only output renders below.
      expect(prompts).toHaveLength(1);
    });

    it('renders a single editable prompt for one entry (no echo)', () => {
      const entries: CommandEntry[] = [
        buildCommandEntry({ cmdName: Command.Help, timestamp: 1000 }),
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      expect(prompts).toHaveLength(1);
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
          cmdName: Command.Cd,
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
          cmdName: Command.Cd,
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
      // Single-prompt model: only the editable main prompt is rendered.
      expect(screen.getAllByTestId('terminal-prompt').length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });
});
