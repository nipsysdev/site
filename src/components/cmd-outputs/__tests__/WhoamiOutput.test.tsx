import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import WhoamiOutput from '../WhoamiOutput';

// Mock the AboutMe component - it just renders simple text
vi.mock('../about-me/AboutMe', () => ({
  default: () => <div>about me / todo</div>,
}));

describe('WhoamiOutput', () => {
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
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
