import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTerminalContext } from '@/contexts/TerminalContext';
import {
  Command,
  type CommandArgument,
  type CommandInfo,
} from '@/types/terminal';
import CmdLink from '../CmdLink';

// Mock the terminal context
vi.mock('@/contexts/TerminalContext', () => ({
  useTerminalContext: vi.fn(),
}));

// Mock the LSD Button component
vi.mock('@acid-info/lsd-react/client/Button', () => ({
  Button: ({ children, onClick, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('CmdLink', () => {
  const mockSetInput = vi.fn();
  const mockSetSimulatedCmd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
      },
    );
  });

  it('renders with cmdName prop', () => {
    render(<CmdLink cmdName="help" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('help')).toBeInTheDocument();
  });

  it('renders with cmdInfo prop', () => {
    const cmdInfo: CommandInfo = {
      name: Command.Whoami,
    };

    render(<CmdLink cmdInfo={cmdInfo} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('whoami')).toBeInTheDocument();
  });

  it('handles click with simple command (no options)', () => {
    render(<CmdLink cmdName="help" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetSimulatedCmd).toHaveBeenCalledWith('help');
    expect(mockSetInput).not.toHaveBeenCalled();
  });

  it('handles click with command that has options', () => {
    const cmdInfo: CommandInfo = {
      name: Command.Contact,
      options: ['email', 'linkedin'],
    };

    render(<CmdLink cmdInfo={cmdInfo} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetInput).toHaveBeenCalledWith('contact ');
    expect(mockSetSimulatedCmd).not.toHaveBeenCalled();
  });

  it('handles click with command argument', () => {
    const cmdInfo: CommandInfo = {
      name: Command.Web3Mission,
    };
    const arg: CommandArgument = {
      name: 'framework',
    };

    render(<CmdLink cmdInfo={cmdInfo} arg={arg} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetInput).toHaveBeenCalledWith('web3-mission --framework=');
    expect(mockSetSimulatedCmd).not.toHaveBeenCalled();
  });

  it('renders command options when cmdInfo has options', () => {
    const cmdInfo: CommandInfo = {
      name: Command.Contact,
      options: ['email', 'linkedin', 'twitter'],
    };

    render(<CmdLink cmdInfo={cmdInfo} />);

    expect(screen.getByText('email|linkedin|twitter')).toBeInTheDocument();
  });

  it('renders argument options when arg has options', () => {
    const cmdInfo: CommandInfo = {
      name: Command.Web3Mission,
    };
    const arg: CommandArgument = {
      name: 'framework',
      options: ['react', 'vue', 'angular'],
    };

    render(<CmdLink cmdInfo={cmdInfo} arg={arg} />);

    expect(screen.getByText('react|vue|angular')).toBeInTheDocument();
  });

  it('truncates argument options when more than 6', () => {
    const cmdInfo: CommandInfo = {
      name: Command.Web3Mission,
    };
    const arg: CommandArgument = {
      name: 'framework',
      options: [
        'react',
        'vue',
        'angular',
        'svelte',
        'solid',
        'qwik',
        'next',
        'nuxt',
      ],
    };

    render(<CmdLink cmdInfo={cmdInfo} arg={arg} />);

    expect(
      screen.getByText('react|vue|angular|svelte|solid|qwik|...'),
    ).toBeInTheDocument();
  });

  it('handles empty cmd gracefully', () => {
    render(<CmdLink />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetSimulatedCmd).not.toHaveBeenCalled();
    expect(mockSetInput).not.toHaveBeenCalled();
  });

  it('prioritizes cmdName over cmdInfo.name', () => {
    const cmdInfo: CommandInfo = {
      name: Command.Intro,
    };

    render(<CmdLink cmdName="help" cmdInfo={cmdInfo} />);

    expect(screen.getByText('help')).toBeInTheDocument();
    expect(screen.queryByText('intro')).not.toBeInTheDocument();
  });

  it('renders with correct button props', () => {
    render(<CmdLink cmdName="help" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-xs', 'w-fit!');
  });
});
