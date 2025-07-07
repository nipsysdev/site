import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContactOutput from '../ContactOutput';
import { Command, type CommandEntry } from '@/types/terminal';

// Mock the Contact component - it just renders simple text
vi.mock('../contact/Contact', () => ({
  default: () => <div>contact / todo</div>,
}));

describe('ContactOutput', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockT = vi.fn((key: string) => key) as any;
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Contact,
  };

  it('renders without crashing', () => {
    const { container } = render(<ContactOutput t={mockT} entry={mockEntry} />);
    expect(container).toBeInTheDocument();
  });

  it('renders the Contact component', () => {
    render(<ContactOutput t={mockT} entry={mockEntry} />);
    expect(screen.getByText('contact / todo')).toBeInTheDocument();
  });

  it('is a class component that extends Component', () => {
    expect(ContactOutput.prototype.render).toBeDefined();
  });
});
