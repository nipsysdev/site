import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCommandEntry } from '@/__tests__/fixtures/terminal-fixtures';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
import { $isAppReady } from '@/stores/app-store';
import {
  $terminalHistory,
  $terminalPromptRef,
  initializeTerminal,
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
  $terminalPromptRef: {
    set: vi.fn(),
    get: vi.fn(() => null),
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

vi.mock('@/components/cmd-outputs/UnknownCmdOutput', () => ({
  default: vi.fn(({ cmdName }) => (
    <div data-testid="unknown-cmd-output">Unknown command: {cmdName}</div>
  )),
}));

describe('TerminalEmulator', () => {
  const mockHistoryGet = vi.mocked($terminalHistory.get);
  const mockIsAppReadyGet = vi.mocked($isAppReady.get);
  const mockInitializeTerminal = vi.mocked(initializeTerminal);

  beforeEach(() => {
    vi.clearAllMocks();
    mockHistoryGet.mockReturnValue([]);
    mockIsAppReadyGet.mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    // The prompt was moved to TopNav; TerminalEmulator is now output-only.
    it('does not render the prompt (owned by TopNav)', () => {
      render(<TerminalEmulator />);
      expect(screen.queryByTestId('terminal-prompt')).not.toBeInTheDocument();
    });

    it('renders no output when history is empty', () => {
      mockHistoryGet.mockReturnValue([]);

      render(<TerminalEmulator />);
      expect(
        screen.queryByTestId('unknown-cmd-output'),
      ).not.toBeInTheDocument();
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
    it('initializes the terminal on app ready', () => {
      render(<TerminalEmulator />);
      expect(mockInitializeTerminal).toHaveBeenCalledWith('welcome');
    });

    it('does not own the prompt ref (owned by TopNav)', () => {
      render(<TerminalEmulator />);
      expect(vi.mocked($terminalPromptRef.set)).not.toHaveBeenCalled();
    });
  });
});
