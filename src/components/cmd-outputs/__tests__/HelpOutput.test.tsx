import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Commands } from '@/constants/commands';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import HelpOutput from '../HelpOutput';

// Mock the CmdLink component and its dependencies
vi.mock('@/components/terminal/CmdLink', () => ({
  default: ({
    cmdInfo,
    arg,
  }: {
    cmdInfo: { name: string };
    arg?: { name: string };
  }) => (
    <button
      type="button"
      data-testid={`cmd-link-${cmdInfo.name}${arg ? `-${arg.name}` : ''}`}
    >
      {cmdInfo.name}
      {arg && ` ${arg.name}`}
    </button>
  ),
}));

// Mock Commands with both regular commands and commands with arguments
vi.mock('@/constants/commands', () => ({
  Commands: [
    { name: 'help' },
    { name: 'clear' },
    {
      name: 'test-cmd',
      arguments: [
        { name: 'arg1', options: ['option1', 'option2'] },
        { name: 'arg2' },
      ],
    },
    { name: 'whoami' },
  ],
}));

// Mock the TerminalContext
vi.mock('@/contexts/TerminalContext', () => ({
  useTerminalContext: () => ({
    setInput: vi.fn(),
    setSimulatedCmd: vi.fn(),
  }),
}));

// Mock LSD React Typography component
vi.mock('@acid-info/lsd-react/client/Typography', () => ({
  Typography: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant: string;
  }) => <div data-testid={`typography-${variant}`}>{children}</div>,
}));

describe('HelpOutput', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Help,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders command arguments when they exist', () => {
    render(<HelpOutput t={mockT} entry={mockEntry} />);

    // Check for commands with arguments
    const testCmdButton = screen.getByTestId('cmd-link-test-cmd');
    expect(testCmdButton).toBeInTheDocument();

    // Check that arg buttons are rendered for commands with arguments
    const arg1Button = screen.getByTestId('cmd-link-test-cmd-arg1');
    const arg2Button = screen.getByTestId('cmd-link-test-cmd-arg2');
    expect(arg1Button).toBeInTheDocument();
    expect(arg2Button).toBeInTheDocument();

    // Check that translation function is called for argument descriptions
    expect(mockT).toHaveBeenCalledWith('cmds.test-cmd.argsDesc.arg1');
    expect(mockT).toHaveBeenCalledWith('cmds.test-cmd.argsDesc.arg2');
  });
});
