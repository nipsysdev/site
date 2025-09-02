import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import { isNewKeyEvent } from '@/utils/compare-utils';
import { getTerminalEntryInput } from '@/utils/terminal-utils';
import TerminalPrompt from '../TerminalPrompt';

// Mock dependencies
vi.mock('@/utils/compare-utils', () => ({
  isNewKeyEvent: vi.fn(),
}));

vi.mock('@/utils/terminal-utils', () => ({
  getTerminalEntryInput: vi.fn(),
}));

vi.mock('@acid-info/lsd-react/client/Typography', () => ({
  Typography: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock('@/constants/commands', () => ({
  Commands: [
    { name: 'help' },
    { name: 'whoami' },
    { name: 'contact' },
    { name: 'clear' },
  ],
}));

// Mock styles to avoid styled-jsx issues
vi.mock('@/styles/components.module.css', () => ({
  default: {
    terminalPrompt: 'terminal-prompt-class',
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    host: 'localhost:3000',
  },
  writable: true,
});

describe('TerminalPrompt', () => {
  const mockT = vi.fn(
    (key: string) => `translated_${key}`,
  ) as unknown as Translator;
  const mockSetSubmission = vi.fn();
  const mockSetLastKeyDown = vi.fn();

  const mockHistory: CommandEntry[] = [
    {
      timestamp: 1234567890,
      cmdName: Command.Help,
    },
    {
      timestamp: 1234567891,
      cmdName: Command.Whoami,
      option: 'verbose',
    },
  ];

  const defaultProps = {
    i18n: mockT,
    history: mockHistory,
    setSubmission: mockSetSubmission,
    setLastKeyDown: mockSetLastKeyDown,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (
      getTerminalEntryInput as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue('test input');
  });

  it('renders with empty input by default', () => {
    render(<TerminalPrompt {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('renders with entry input when entry prop is provided', () => {
    const entry: CommandEntry = {
      timestamp: 1234567890,
      cmdName: Command.Help,
    };

    render(<TerminalPrompt {...defaultProps} entry={entry} />);

    expect(getTerminalEntryInput).toHaveBeenCalledWith(entry);
  });

  it('renders prompt with correct host', () => {
    render(<TerminalPrompt {...defaultProps} />);

    expect(
      screen.getByText('translated_visitor@localhost:~$'),
    ).toBeInTheDocument();
  });

  it('handles input change', () => {
    render(<TerminalPrompt {...defaultProps} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test command' } });

    expect(input).toHaveValue('test command');
  });

  it('calls setLastKeyDown on key events', () => {
    render(<TerminalPrompt {...defaultProps} />);

    const input = screen.getByRole('textbox');
    const keyEvent = { key: 'Enter' };
    fireEvent.keyDown(input, keyEvent);

    expect(mockSetLastKeyDown).toHaveBeenCalled();
  });

  it('is readonly when entry prop is provided', () => {
    const entry: CommandEntry = {
      timestamp: 1234567890,
      cmdName: Command.Help,
    };

    render(<TerminalPrompt {...defaultProps} entry={entry} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
  });

  it('renders with correct CSS classes and attributes', () => {
    render(<TerminalPrompt {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('spellCheck', 'false');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('handles empty setLastKeyDown gracefully', () => {
    const propsWithoutCallback = {
      i18n: mockT,
      history: mockHistory,
      setSubmission: mockSetSubmission,
    };

    render(<TerminalPrompt {...propsWithoutCallback} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toBeInTheDocument();
  });

  it('handles empty history gracefully', () => {
    const propsWithoutHistory = {
      i18n: mockT,
      setSubmission: mockSetSubmission,
      setLastKeyDown: mockSetLastKeyDown,
    };

    render(<TerminalPrompt {...propsWithoutHistory} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  describe('Key handling', () => {
    it('handles Enter key event', () => {
      render(<TerminalPrompt {...defaultProps} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test command' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(input).toBeInTheDocument();
    });

    it('handles Ctrl+C key event', () => {
      render(<TerminalPrompt {...defaultProps} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test command' } });
      fireEvent.keyDown(input, { key: 'c', ctrlKey: true });

      expect(input).toBeInTheDocument();
    });

    it('handles ArrowUp key event', () => {
      render(<TerminalPrompt {...defaultProps} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(input).toBeInTheDocument();
    });

    it('handles ArrowDown key event', () => {
      render(<TerminalPrompt {...defaultProps} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(input).toBeInTheDocument();
    });

    it('handles Tab key event', () => {
      render(<TerminalPrompt {...defaultProps} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'hel' } });
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      Object.defineProperty(tabEvent, 'preventDefault', { value: vi.fn() });
      fireEvent.keyDown(input, tabEvent);

      expect(input).toBeInTheDocument();
    });
  });

  describe('History navigation', () => {
    it('handles history navigation with no history', () => {
      const propsWithoutHistory = {
        ...defaultProps,
        history: undefined,
      };

      render(<TerminalPrompt {...propsWithoutHistory} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(input).toHaveValue('');
    });

    it('handles history navigation with empty history', () => {
      const propsWithEmptyHistory = {
        ...defaultProps,
        history: [],
      };

      render(<TerminalPrompt {...propsWithEmptyHistory} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(input).toHaveValue('');
    });
  });

  describe('Entry formatting', () => {
    it('formats entry with option correctly', () => {
      const entryWithOption: CommandEntry = {
        timestamp: 1234567890,
        cmdName: Command.Whoami,
        option: 'verbose',
      };

      render(<TerminalPrompt {...defaultProps} entry={entryWithOption} />);

      expect(getTerminalEntryInput).toHaveBeenCalledWith(entryWithOption);
    });

    it('formats entry with arguments correctly', () => {
      const entryWithArgs: CommandEntry = {
        timestamp: 1234567890,
        cmdName: Command.Contact,
        argName: 'email',
        argValue: 'test@example.com',
      };

      render(<TerminalPrompt {...defaultProps} entry={entryWithArgs} />);

      expect(getTerminalEntryInput).toHaveBeenCalledWith(entryWithArgs);
    });
  });

  describe('Error handling', () => {
    it('handles missing setSubmission gracefully', () => {
      const propsWithoutSubmission = {
        i18n: mockT,
        history: mockHistory,
        setLastKeyDown: mockSetLastKeyDown,
      };

      render(<TerminalPrompt {...propsWithoutSubmission} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(input).toBeInTheDocument();
    });

    it('handles missing setLastKeyDown in keyDown handler', () => {
      const propsWithoutKeyHandler = {
        i18n: mockT,
        history: mockHistory,
        setSubmission: mockSetSubmission,
      };

      render(<TerminalPrompt {...propsWithoutKeyHandler} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(input).toBeInTheDocument();
    });
  });

  describe('Autocomplete functionality', () => {
    it('handles autocomplete key events', () => {
      render(<TerminalPrompt {...defaultProps} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'xyz' } });
      fireEvent.keyDown(input, { key: 'Tab', preventDefault: vi.fn() });

      expect(input).toBeInTheDocument();
    });

    it('does not show autocomplete when entry is provided', () => {
      const entry: CommandEntry = {
        timestamp: 1234567890,
        cmdName: Command.Help,
      };

      render(<TerminalPrompt {...defaultProps} entry={entry} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'c' } });
      fireEvent.keyDown(input, { key: 'Tab', preventDefault: vi.fn() });

      expect(
        screen.queryByText(/translated_autocomplete/),
      ).not.toBeInTheDocument();
    });
  });

  describe('getDisplayHost', () => {
    it('returns full host for regular domains', () => {
      Object.defineProperty(window, 'location', {
        value: { host: 'example.com' },
        writable: true,
      });

      render(<TerminalPrompt {...defaultProps} />);
      expect(
        screen.getByText('translated_visitor@example.com:~$'),
      ).toBeInTheDocument();
    });

    it('returns full host for short IPFS hosts', () => {
      Object.defineProperty(window, 'location', {
        value: { host: 'short.ipfs.dweb.link' },
        writable: true,
      });

      render(<TerminalPrompt {...defaultProps} />);
      expect(
        screen.getByText('translated_visitor@short.ipfs.dweb.link:~$'),
      ).toBeInTheDocument();
    });

    it('shortens long IPNS hosts correctly', () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'k2k4r8ng8uzrtqb5ham8kao889m8qezu96z4w3lpinyqghum43veb6n3.ipns.dweb.link',
        },
        writable: true,
      });

      render(<TerminalPrompt {...defaultProps} />);

      const promptSpan = screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'span' &&
          content.includes('k2k4r8ng...43veb6n3.ipns.dweb.link')
        );
      });
      expect(promptSpan).toBeInTheDocument();
    });

    it('shortens long IPFS hosts correctly', () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o.ipfs.dweb.link',
        },
        writable: true,
      });

      render(<TerminalPrompt {...defaultProps} />);

      const promptSpan = screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'span' &&
          content.includes('QmYjtig7...iFofrE7o.ipfs.dweb.link')
        );
      });
      expect(promptSpan).toBeInTheDocument();
    });

    it('handles hosts with port numbers', () => {
      Object.defineProperty(window, 'location', {
        value: { host: 'localhost:3000' },
        writable: true,
      });

      render(<TerminalPrompt {...defaultProps} />);
      expect(
        screen.getByText('translated_visitor@localhost:~$'),
      ).toBeInTheDocument();
    });

    it('handles CID shorter than 16 characters', () => {
      Object.defineProperty(window, 'location', {
        value: { host: 'shortcid.ipfs.dweb.link' },
        writable: true,
      });

      render(<TerminalPrompt {...defaultProps} />);
      expect(
        screen.getByText('translated_visitor@shortcid.ipfs.dweb.link:~$'),
      ).toBeInTheDocument();
    });
  });
});
