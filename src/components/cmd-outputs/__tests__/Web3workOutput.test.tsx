import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import Web3workOutput from '../Web3workOutput';

vi.mock('../web3work/Web3work', () => ({
  default: () => <div>web3work / todo</div>,
}));

describe('Web3workOutput', () => {
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Web3work,
  };

  it('renders the Web3work component', () => {
    render(<Web3workOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('web3work / todo')).toBeInTheDocument();
  });
});
