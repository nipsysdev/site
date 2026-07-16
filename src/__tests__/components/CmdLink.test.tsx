import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CmdLink from '@/components/terminal/CmdLink';
import {
  Command,
  type CommandArgument,
  type CommandInfo,
} from '@/types/terminal';

vi.mock('@/stores/terminal-store', () => ({
  $terminalInput: {
    set: vi.fn(),
  },
  simulateInput: vi.fn(),
}));

import { $terminalInput, simulateInput } from '@/stores/terminal-store';

describe('CmdLink', () => {
  const mockSetInput = vi.mocked($terminalInput.set);
  const mockSimulateInput = vi.mocked(simulateInput);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders with cmdName', () => {
      render(<CmdLink cmdName={Command.Help} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('help')).toBeInTheDocument();
    });

    it('renders with cmdInfo', () => {
      const cmdInfo: CommandInfo = {
        name: Command.BuildInfo,
      };
      render(<CmdLink cmdInfo={cmdInfo} />);
      expect(screen.getByText('build-info')).toBeInTheDocument();
    });

    it('renders with options when cmdInfo has options', () => {
      const cmdInfo: CommandInfo = {
        name: Command.Help,
        options: ['--all', '--short'],
      };
      render(<CmdLink cmdInfo={cmdInfo} />);
      expect(screen.getByText('help')).toBeInTheDocument();
      // Each flag is bracketed to read as a separate, optional modifier.
      const button = screen.getByRole('button');
      expect(button.textContent).toContain('[--all]');
      expect(button.textContent).toContain('[--short]');
    });

    it('renders flags and usage together when both are set', () => {
      const cmdInfo: CommandInfo = {
        name: Command.Ls,
        options: ['-l', '-a'],
        usage: '[path]',
      };
      render(<CmdLink cmdInfo={cmdInfo} />);
      const button = screen.getByRole('button');
      expect(button.textContent).toContain('[-l]');
      expect(button.textContent).toContain('[-a]');
      expect(button.textContent).toContain('[path]');
    });

    it('renders the usage hint when cmdInfo has usage', () => {
      const cmdInfo: CommandInfo = { name: Command.Ls, usage: '[path]' };
      render(<CmdLink cmdInfo={cmdInfo} />);
      expect(screen.getByText('ls')).toBeInTheDocument();
      expect(screen.getByRole('button').textContent).toContain('[path]');
    });

    it('renders with argument options when arg has options', () => {
      const cmdInfo: CommandInfo = {
        name: Command.Help,
      };
      const arg: CommandArgument = {
        name: 'format',
        options: ['json', 'yaml', 'xml'],
      };
      render(<CmdLink cmdInfo={cmdInfo} arg={arg} />);
      expect(screen.getByText('help')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button.textContent).toContain('--format=');
    });

    it('truncates argument options to 6 with ellipsis', () => {
      const cmdInfo: CommandInfo = {
        name: Command.Help,
      };
      const arg: CommandArgument = {
        name: 'option',
        options: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      };
      render(<CmdLink cmdInfo={cmdInfo} arg={arg} />);
      // Should show first 6 options and then |...
      const button = screen.getByRole('button');
      expect(button.textContent).toContain('a|b|c|d|e|f|...');
    });

    it('renders nothing when no cmdName or cmdInfo provided', () => {
      const { container } = render(<CmdLink />);
      // Button should still render but with empty content
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('click behavior', () => {
    it('calls simulateInput when clicked with simple command', () => {
      render(<CmdLink cmdName={Command.Whoami} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockSimulateInput).toHaveBeenCalledWith('whoami');
    });

    it('sets input with space when command has options', () => {
      const cmdInfo: CommandInfo = {
        name: Command.Help,
        options: ['--all'],
      };
      render(<CmdLink cmdInfo={cmdInfo} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockSetInput).toHaveBeenCalledWith('help ');
      expect(mockSimulateInput).not.toHaveBeenCalled();
    });

    it('sets input with space when command has usage', () => {
      const cmdInfo: CommandInfo = { name: Command.Cat, usage: '<file>' };
      render(<CmdLink cmdInfo={cmdInfo} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockSetInput).toHaveBeenCalledWith('cat ');
      expect(mockSimulateInput).not.toHaveBeenCalled();
    });

    it('sets input with argument pattern when arg is provided', () => {
      const cmdInfo: CommandInfo = {
        name: Command.Help,
      };
      const arg: CommandArgument = {
        name: 'format',
      };
      render(<CmdLink cmdInfo={cmdInfo} arg={arg} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockSetInput).toHaveBeenCalledWith('help --format=');
      expect(mockSimulateInput).not.toHaveBeenCalled();
    });

    it('does nothing when clicked with no command', () => {
      render(<CmdLink />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockSetInput).not.toHaveBeenCalled();
      expect(mockSimulateInput).not.toHaveBeenCalled();
    });

    it('prefers cmdName over cmdInfo.name', () => {
      const cmdInfo: CommandInfo = {
        name: Command.Help,
      };
      render(<CmdLink cmdName={Command.Whoami} cmdInfo={cmdInfo} />);
      expect(screen.getByText('whoami')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has button role', () => {
      render(<CmdLink cmdName={Command.Help} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is clickable via keyboard', () => {
      render(<CmdLink cmdName={Command.Help} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
