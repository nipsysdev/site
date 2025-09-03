import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import Web2workOutput from '../Web2workOutput';

vi.mock('../web2work/Web2work', () => ({
  default: () => <div>web2work / todo</div>,
}));

describe('Web2workOutput', () => {
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Web2work,
  };

  it('renders the Web2work component', () => {
    render(<Web2workOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('web2work / todo')).toBeInTheDocument();
  });
});
