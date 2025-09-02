import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import Web3MissionOutput from '../Web3MissionOutput';

// Mock the Web3Mission component - it just renders simple text
vi.mock('../web3-mission/Web3Mission', () => ({
  default: () => <div>web3 mission / todo</div>,
}));

describe('Web3MissionOutput', () => {
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Web3Mission,
  };

  it('renders the Web3Mission component', () => {
    render(<Web3MissionOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('web3 mission / todo')).toBeInTheDocument();
  });
});
