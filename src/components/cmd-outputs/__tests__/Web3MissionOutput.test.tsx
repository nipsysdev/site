import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Web3MissionOutput from '../Web3MissionOutput';
import { Command, type CommandEntry } from '@/types/terminal';

// Mock the Web3Mission component - it just renders simple text
vi.mock('../web3-mission/Web3Mission', () => ({
  default: () => <div>web3 mission / todo</div>,
}));

describe('Web3MissionOutput', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockT = vi.fn((key: string) => key) as any;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Web3Mission,
  };

  it('renders without crashing', () => {
    const { container } = render(<Web3MissionOutput t={mockT} entry={mockEntry} />);
    expect(container).toBeInTheDocument();
  });

  it('renders the Web3Mission component', () => {
    render(<Web3MissionOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('web3 mission / todo')).toBeInTheDocument();
  });

  it('is a class component that extends Component', () => {
    expect(Web3MissionOutput.prototype.render).toBeDefined();
  });
});
