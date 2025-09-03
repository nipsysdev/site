import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import WelcomeOutput from '../WelcomeOutput';

// Mock the CmdLink component
vi.mock('../terminal/CmdLink', () => ({
  default: ({ cmdName }: { cmdName: string }) => (
    <div data-testid={`cmd-link-${cmdName}`}>{cmdName}</div>
  ),
}));

describe('WelcomeOutput', () => {
  const mockT = vi.fn((key: string) => key) as unknown as Translator;
  const mockTRich = vi.fn((key: string, values?: Record<string, unknown>) => {
    if (values && typeof values.name === 'function') {
      return (values.name as (name: string) => ReactElement)('nipsysdev');
    }
    if (values && typeof values.cmd === 'function') {
      return (values.cmd as () => ReactElement)();
    }
    return key;
  });

  const mockTWithRich = Object.assign(mockT, { rich: mockTRich });
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.Welcome,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message', () => {
    render(<WelcomeOutput t={mockTWithRich} entry={mockEntry} />);
    expect(mockTRich).toHaveBeenCalledWith(
      'cmds.welcome.welcome',
      expect.any(Object),
    );
  });

  it('renders site welcome text', () => {
    render(<WelcomeOutput t={mockTWithRich} entry={mockEntry} />);
    expect(mockT).toHaveBeenCalledWith('cmds.welcome.site_intro_1');
    expect(mockTRich).toHaveBeenCalledWith(
      'cmds.welcome.site_intro_2',
      expect.any(Object),
    );
  });

  it('renders ascii art', () => {
    const { container } = render(
      <WelcomeOutput t={mockTWithRich} entry={mockEntry} />,
    );

    const asciiDiv = container.querySelector('.whitespace-break-spaces');
    expect(asciiDiv).toBeInTheDocument();
    // Check for part of the ASCII art content
    expect(asciiDiv).toHaveTextContent('_ __');
  });
});
