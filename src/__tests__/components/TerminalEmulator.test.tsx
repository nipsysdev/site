import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TerminalEmulator from '@/components/terminal/TerminalEmulator';
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

import {
  $terminalHistory,
  $terminalHistoryVisibleIdx,
  $terminalPromptRef,
} from '@/stores/terminal-store';

describe('TerminalEmulator', () => {
  const mockHistoryGet = vi.mocked($terminalHistory.get);
  const mockHistoryVisibleIdxGet = vi.mocked($terminalHistoryVisibleIdx.get);
  const mockPromptRefSet = vi.mocked($terminalPromptRef.set);

  beforeEach(() => {
    vi.clearAllMocks();
    mockHistoryGet.mockReturnValue([]);
    mockHistoryVisibleIdxGet.mockReturnValue(0);
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
        { timestamp: 1000, cmdName: Command.Help },
        { timestamp: 2000, cmdName: Command.Whoami },
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      const prompts = screen.getAllByTestId('terminal-prompt');
      expect(prompts).toHaveLength(3);
    });

    it('respects historyVisibleIdx to slice history', () => {
      const entries: CommandEntry[] = [
        { timestamp: 1000, cmdName: Command.Help },
        { timestamp: 2000, cmdName: Command.Whoami },
        { timestamp: 3000, cmdName: Command.Contact },
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
        {
          timestamp: 1000,
          cmdName: Command.Help,
          output: MockOutput,
        },
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(screen.getByTestId('mock-output')).toBeInTheDocument();
    });

    it('renders UnknownCmdOutput when entry has cmdName but no output', () => {
      const entries: CommandEntry[] = [
        { timestamp: 1000, cmdName: Command.Help },
      ];
      mockHistoryGet.mockReturnValue(entries);

      render(<TerminalEmulator />);
      expect(screen.getByTestId('unknown-cmd-output')).toBeInTheDocument();
    });

    it('does not render output when entry has no cmdName', () => {
      const entries: CommandEntry[] = [
        { timestamp: 1000, cmdName: undefined as unknown as Command },
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
      render(<TerminalEmulator />);
      const container = screen.getByRole('button');

      expect(mockPromptRefSet).toHaveBeenCalled();

      fireEvent.click(container);
      expect(container).toBeInTheDocument();
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
  });

  describe('store integration', () => {
    it('sets prompt ref on mount', () => {
      render(<TerminalEmulator />);
      expect(mockPromptRefSet).toHaveBeenCalled();
    });

    it('uses history from store', () => {
      const entries: CommandEntry[] = [
        { timestamp: 1000, cmdName: Command.Help },
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
