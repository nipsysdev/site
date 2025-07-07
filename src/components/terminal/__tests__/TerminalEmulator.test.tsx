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
      intro: {
        cmdName: Command.Intro,
        output: () => <div data-testid="intro-output">Intro Output</div>,
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
      'web3-mission': {
        cmdName: Command.Web3Mission,
        output: () => (
          <div data-testid="web3-mission-output">Web3 Mission Output</div>
        ),
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

vi.mock('../../cmd-outputs/IntroOutput', () => ({
  default: () => <div data-testid="intro-output">Intro Output</div>,
}));

vi.mock('../../cmd-outputs/ContactOutput', () => ({
  default: () => <div data-testid="contact-output">Contact Output</div>,
}));

vi.mock('../../cmd-outputs/WhoamiOutput', () => ({
  default: () => <div data-testid="whoami-output">Whoami Output</div>,
}));

vi.mock('../../cmd-outputs/Web3MissionOutput', () => ({
  default: () => (
    <div data-testid="web3-mission-output">Web3 Mission Output</div>
  ),
}));

describe('TerminalEmulator', () => {
  const mockSetIsTerminal = vi.fn();
  const mockSetHasIntroduced = vi.fn();
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
        hasIntroduced: true,
        history: [],
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasIntroduced: mockSetHasIntroduced,
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

  it('sets introduction when not prerendering and not introduced', async () => {
    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasIntroduced: false,
        history: [],
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasIntroduced: mockSetHasIntroduced,
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
      expect(mockSetHasIntroduced).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(mockPromptMethods.simulate).toHaveBeenCalledWith(Command.Intro);
    });
  });

  it('handles clear submission command', () => {
    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasIntroduced: true,
        history: [{ cmdName: 'test', timestamp: 123 }],
        input: '',
        simulatedCmd: '',
        submission: 'clear',
        setHasIntroduced: mockSetHasIntroduced,
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

  it('renders history items', () => {
    const mockHistory = [
      {
        cmdName: Command.Help,
        output: () => <div data-testid="help-output">Help Output</div>,
        timestamp: 123,
      },
      {
        cmdName: Command.Intro,
        output: () => <div data-testid="intro-output">Intro Output</div>,
        timestamp: 456,
      },
    ];

    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasIntroduced: true,
        history: mockHistory,
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasIntroduced: mockSetHasIntroduced,
        setHasRefreshed: mockSetHasRefreshed,
        setHistory: mockSetHistory,
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
        setSubmission: mockSetSubmission,
      },
    );

    render(<TerminalEmulator />);

    expect(screen.getByTestId('help-output')).toBeInTheDocument();
    expect(screen.getByTestId('intro-output')).toBeInTheDocument();
  });

  it('renders unknown command for unrecognized commands', () => {
    const mockHistory = [{ cmdName: 'unknown-command', timestamp: 123 }];

    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasIntroduced: true,
        history: mockHistory,
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasIntroduced: mockSetHasIntroduced,
        setHasRefreshed: mockSetHasRefreshed,
        setHistory: mockSetHistory,
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
        setSubmission: mockSetSubmission,
      },
    );

    render(<TerminalEmulator />);

    expect(screen.getByTestId('unknown-cmd-output')).toBeInTheDocument();
    expect(screen.getByText('unknown-command')).toBeInTheDocument();
  });

  it('handles all supported command types', () => {
    const allCommands = [
      {
        cmdName: Command.Help,
        output: () => <div data-testid="help-output">Help Output</div>,
        timestamp: 1,
      },
      {
        cmdName: Command.Intro,
        output: () => <div data-testid="intro-output">Intro Output</div>,
        timestamp: 2,
      },
      {
        cmdName: Command.Contact,
        output: () => <div data-testid="contact-output">Contact Output</div>,
        timestamp: 3,
      },
      {
        cmdName: Command.Whoami,
        output: () => <div data-testid="whoami-output">Whoami Output</div>,
        timestamp: 4,
      },
      {
        cmdName: Command.Web3Mission,
        output: () => (
          <div data-testid="web3-mission-output">Web3 Mission Output</div>
        ),
        timestamp: 5,
      },
    ];

    (useTerminalContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      {
        hasIntroduced: true,
        history: allCommands,
        input: '',
        simulatedCmd: '',
        submission: '',
        setHasIntroduced: mockSetHasIntroduced,
        setHasRefreshed: mockSetHasRefreshed,
        setHistory: mockSetHistory,
        setInput: mockSetInput,
        setSimulatedCmd: mockSetSimulatedCmd,
        setSubmission: mockSetSubmission,
      },
    );

    render(<TerminalEmulator />);

    expect(screen.getByTestId('help-output')).toBeInTheDocument();
    expect(screen.getByTestId('intro-output')).toBeInTheDocument();
    expect(screen.getByTestId('contact-output')).toBeInTheDocument();
    expect(screen.getByTestId('whoami-output')).toBeInTheDocument();
    expect(screen.getByTestId('web3-mission-output')).toBeInTheDocument();
  });
});
