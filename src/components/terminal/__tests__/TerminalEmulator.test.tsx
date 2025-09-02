import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppContext } from '@/contexts/AppContext';
import { useTerminalContext } from '@/contexts/TerminalContext';
import useIsPrerender from '@/hooks/useIsPrerender';
import { Command } from '@/types/terminal';
import TerminalEmulator from '../TerminalEmulator';

// Mock all dependencies
vi.mock('@/contexts/TerminalContext', () => ({
  useTerminalContext: vi.fn(),
}));

vi.mock('@/contexts/AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('@/hooks/useIsPrerender', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/terminal-utils', () => ({
  parseTerminalEntry: vi.fn((entry: string) => {
    // Map entries to their proper command structure
    const entryMap: Record<
      string,
      { cmdName: Command; output?: () => React.ReactElement; timestamp: number }
    > = {
      help: {
        cmdName: Command.Help,
        output: () => <div data-testid="help-output">Help Output</div>,
        timestamp: Date.now(),
      },
      welcome: {
        cmdName: Command.Welcome,
        output: () => <div data-testid="welcome-output">Welcome Output</div>,
        timestamp: Date.now(),
      },
      contact: {
        cmdName: Command.Contact,
        output: () => <div data-testid="contact-output">Contact Output</div>,
        timestamp: Date.now(),
      },
      whoami: {
        cmdName: Command.Whoami,
        output: () => <div data-testid="whoami-output">Whoami Output</div>,
        timestamp: Date.now(),
      },
      web2work: {
        cmdName: Command.Web2work,
        output: () => <div data-testid="web2work-output">Web2work Output</div>,
        timestamp: Date.now(),
      },
    };

    return (
      entryMap[entry] || {
        cmdName: entry,
        timestamp: Date.now(),
      }
    );
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => `translated_${key}`),
}));

// Mock TerminalPrompt with a ref
const mockPromptMethods = {
  focus: vi.fn(),
  simulate: vi.fn(),
  scrollIntoView: vi.fn(),
  setInput: vi.fn(),
};

vi.mock('../TerminalPrompt', () => ({
  default: React.forwardRef<typeof mockPromptMethods, Record<string, unknown>>(
    (props, ref) => {
      React.useImperativeHandle(ref, () => mockPromptMethods);
      return <div data-testid="terminal-prompt" {...props} />;
    },
  ),
}));

// Mock command output components
vi.mock('../../cmd-outputs/UnknownCmdOutput', () => ({
  default: ({ cmdName }: { cmdName: string }) => (
    <div data-testid="unknown-cmd-output">{cmdName}</div>
  ),
}));

vi.mock('../../cmd-outputs/HelpOutput', () => ({
  default: () => <div data-testid="help-output">Help Output</div>,
}));

vi.mock('../../cmd-outputs/WelcomeOutput', () => ({
  default: () => <div data-testid="welcome-output">Welcome Output</div>,
}));

vi.mock('../../cmd-outputs/ContactOutput', () => ({
  default: () => <div data-testid="contact-output">Contact Output</div>,
}));

vi.mock('../../cmd-outputs/WhoamiOutput', () => ({
  default: () => <div data-testid="whoami-output">Whoami Output</div>,
}));

vi.mock('../../cmd-outputs/Web2workOutput', () => ({
  default: () => <div data-testid="web2work-output">Web2work Output</div>,
}));

describe('TerminalEmulator', () => {
  const mockSetIsTerminal = vi.fn();
  const mockSetHasWelcomed = vi.fn();
  const mockSetHasRefreshed = vi.fn();
  const mockSetHistory = vi.fn();
  const mockSetInput = vi.fn();
  const mockSetSimulatedCmd = vi.fn();
  const mockSetSubmission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPromptMethods.focus.mockClear();
    mockPromptMethods.simulate.mockClear();
    mockPromptMethods.scrollIntoView.mockClear();
    mockPromptMethods.setInput.mockClear();

    // Mock window object since the component checks for it
    Object.defineProperty(window, 'window', {
      value: window,
      writable: true,
    });

    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasWelcomed: true,
        history: [],
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasWelcomed: mockSetHasWelcomed,
        setHasRefreshed: mockSetHasRefreshed,
        setHistory: mockSetHistory,
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
        setSubmission: mockSetSubmission,
      },
    );

    (useAppContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isTerminal: false,
      lastKeyDown: null,
      setIsTerminal: mockSetIsTerminal,
      setLastKeyDown: vi.fn(),
    });

    (useIsPrerender as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    );
  });

  it('renders terminal prompt', () => {
    render(<TerminalEmulator />);
    expect(screen.getByTestId('terminal-prompt')).toBeInTheDocument();
  });

  it('sets isTerminal to true on mount', () => {
    render(<TerminalEmulator />);
    expect(mockSetIsTerminal).toHaveBeenCalledWith(true);
  });

  it('sets welcome when not prerendering and not welcomed', async () => {
    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasWelcomed: false,
        history: [],
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasWelcomed: mockSetHasWelcomed,
        setHasRefreshed: mockSetHasRefreshed,
        setHistory: mockSetHistory,
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
        setSubmission: mockSetSubmission,
      },
    );

    (useIsPrerender as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false,
    );

    render(<TerminalEmulator />);

    await waitFor(() => {
      expect(mockSetHasWelcomed).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(mockPromptMethods.simulate).toHaveBeenCalledWith(Command.Welcome);
    });
  });

  it('handles clear submission command', () => {
    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasWelcomed: true,
        history: [{ cmdName: 'test', timestamp: 123 }],
        input: '',
        simulatedCmd: '',
        submission: 'clear',
        setHasWelcomed: mockSetHasWelcomed,
        setHasRefreshed: mockSetHasRefreshed,
        setHistory: mockSetHistory,
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
        setSubmission: mockSetSubmission,
      },
    );

    render(<TerminalEmulator />);

    expect(mockSetSubmission).toHaveBeenCalledWith('');
    expect(mockSetHasRefreshed).toHaveBeenCalledWith(false);
    expect(mockSetHistory).toHaveBeenCalledWith([]);
  });

  it('renders history items with different command types', () => {
    const mockHistory = [
      {
        cmdName: Command.Help,
        output: () => <div data-testid="help-output">Help Output</div>,
        timestamp: 123,
      },
      {
        cmdName: Command.Welcome,
        output: () => <div data-testid="welcome-output">Welcome Output</div>,
        timestamp: 456,
      },
      {
        cmdName: 'unknown-command',
        timestamp: 789,
      },
    ];

    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasWelcomed: true,
        history: mockHistory,
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasWelcomed: mockSetHasWelcomed,
        setHasRefreshed: mockSetHasRefreshed,
        setHistory: mockSetHistory,
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
        setSubmission: mockSetSubmission,
      },
    );

    render(<TerminalEmulator />);

    expect(screen.getByTestId('help-output')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-output')).toBeInTheDocument();
    expect(screen.getByTestId('unknown-cmd-output')).toBeInTheDocument();
    expect(screen.getByText('unknown-command')).toBeInTheDocument();
  });
});
