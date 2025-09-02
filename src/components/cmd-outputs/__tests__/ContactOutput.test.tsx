import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import ContactOutput from '../ContactOutput';

// Mock the Contact component - it just renders simple text
vi.mock('../contact/Contact', () => ({
  default: () => <div>contact / todo</div>,
}));

describe('ContactOutput', () => {
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Contact,
  };

  it('renders the Contact component', () => {
    render(<ContactOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('contact / todo')).toBeInTheDocument();
  });
});
