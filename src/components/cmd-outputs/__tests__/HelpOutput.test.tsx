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

// Mock LSD React Typography and Button components
vi.mock('@acid-info/lsd-react/components', () => ({
  Typography: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant: string;
  }) => <div data-testid={`typography-${variant}`}>{children}</div>,
  Button: ({
    children,
    variant,
    size,
  }: {
    children: React.ReactNode;
    variant: string;
    size: string;
  }) => (
    <button type="button" data-testid={`button-${variant}-${size}`}>
      {children}
    </button>
  ),
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

  it('renders without crashing', () => {
    const { container } = render(<HelpOutput t={mockT} entry={mockEntry} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders all commands from Commands constant', () => {
    render(<HelpOutput t={mockT} entry={mockEntry} />);

    Commands.forEach((cmd) => {
      // Check that at least one button with the command name exists
      const buttons = screen
        .getAllByRole('button')
        .filter((button) => button.textContent?.includes(cmd.name));
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('calls translation function for command descriptions', () => {
    render(<HelpOutput t={mockT} entry={mockEntry} />);

    Commands.forEach((cmd) => {
      expect(mockT).toHaveBeenCalledWith(`cmds.${cmd.name}.description`);
    });
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

  it('handles commands without arguments gracefully', () => {
    render(<HelpOutput t={mockT} entry={mockEntry} />);

    // Commands without arguments should still render their main button
    const helpButton = screen.getByTestId('cmd-link-help');
    const clearButton = screen.getByTestId('cmd-link-clear');
    expect(helpButton).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();
  });

  it('renders proper typography variants', () => {
    render(<HelpOutput t={mockT} entry={mockEntry} />);

    const subtitleElements = screen.getAllByTestId('typography-subtitle3');
    expect(subtitleElements.length).toBeGreaterThan(0);
  });

  it('renders with proper CSS classes', () => {
    const { container } = render(<HelpOutput t={mockT} entry={mockEntry} />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'gap-y-(--lsd-spacing-8)');
  });
});
