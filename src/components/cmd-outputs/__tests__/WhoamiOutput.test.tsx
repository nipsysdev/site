import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WhoamiOutput from '../WhoamiOutput';
import { Command, type CommandEntry } from '@/types/terminal';

// Mock the AboutMe component - it just renders simple text
vi.mock('../about-me/AboutMe', () => ({
  default: () => <div>about me / todo</div>,
}));

describe('WhoamiOutput', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockT = vi.fn((key: string) => key) as any;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Whoami,
  };

  it('renders without crashing', () => {
    const { container } = render(<WhoamiOutput t={mockT} entry={mockEntry} />);
    expect(container).toBeInTheDocument();
  });

  it('renders the AboutMe component', () => {
    render(<WhoamiOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('about me / todo')).toBeInTheDocument();
  });

  it('is a class component that extends Component', () => {
    expect(WhoamiOutput.prototype.render).toBeDefined();
  });
});
