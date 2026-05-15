import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UnknownCmdOutput from '@/components/cmd-outputs/UnknownCmdOutput';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      unknownCmdErr: 'Unknown command',
    };
    return translations[key] ?? key;
  }),
}));

vi.mock('@phosphor-icons/react', () => ({
  SmileyNervousIcon: vi.fn(() => <span data-testid="nervous-icon">😰</span>),
}));

describe('UnknownCmdOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('renders the nervous icon', () => {
      render(<UnknownCmdOutput cmdName="badcmd" />);
      expect(screen.getByTestId('nervous-icon')).toBeInTheDocument();
    });

    it('displays the unknown command error message', () => {
      render(<UnknownCmdOutput cmdName="badcmd" />);
      expect(screen.getByText(/Unknown command:/)).toBeInTheDocument();
    });

    it('includes the command name in the message', () => {
      render(<UnknownCmdOutput cmdName="foobar" />);
      expect(screen.getByText(/foobar/)).toBeInTheDocument();
    });

    it('handles empty command name', () => {
      render(<UnknownCmdOutput cmdName="" />);
      expect(screen.getByText(/Unknown command:/)).toBeInTheDocument();
    });

    it('handles special characters in command name', () => {
      render(<UnknownCmdOutput cmdName="rm -rf /" />);
      expect(screen.getByText(/rm -rf \//)).toBeInTheDocument();
    });
  });
});
