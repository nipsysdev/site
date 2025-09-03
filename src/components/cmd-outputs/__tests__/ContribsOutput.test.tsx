import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import ContribsOutput from '../ContribsOutput';

vi.mock('../contribs/Contribs', () => ({
  default: () => <div>contribs / todo</div>,
}));

describe('ContribsOutput', () => {
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Contribs,
  };

  it('renders the Contribs component', () => {
    render(<ContribsOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('contribs / todo')).toBeInTheDocument();
  });
});
