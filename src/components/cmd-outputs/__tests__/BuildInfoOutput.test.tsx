import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Translator } from '@/i18n/intl';
import { Command, type CommandEntry } from '@/types/terminal';
import BuildInfoOutput from '../BuildInfoOutput';

// Mock the environment variables
const mockEnv = vi.hoisted(() => ({
  BUILD_TIMESTAMP: '2024-01-15T10:30:00.000Z',
  IPNS_HASH: 'k51qzi5uqu5dh5kbbff1ucw3ksphpy3vxx4en4dbtfh90pvw4mzd8nfm5r5fnl',
}));

vi.stubGlobal('process', {
  env: mockEnv,
});

// Mock translation function
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'cmds.build-info.title': 'Build Information',
  };
  return translations[key] || key;
}) as unknown as Translator;

describe('BuildInfoOutput', () => {
  const mockEntry: CommandEntry = {
    timestamp: Date.now(),
    cmdName: Command.BuildInfo,
  };

  it('renders build information correctly', () => {
    render(<BuildInfoOutput t={mockT} entry={mockEntry} />);

    expect(screen.getByText('Build Information')).toBeInTheDocument();
    expect(screen.getByText('Build Time:')).toBeInTheDocument();
    expect(screen.getByText('IPNS Name:')).toBeInTheDocument();
  });

  it('displays formatted build timestamp', () => {
    render(<BuildInfoOutput t={mockT} entry={mockEntry} />);

    // The timestamp should be formatted as a locale string
    const buildTimeElement = screen.getByText(/Build Time:/);
    expect(buildTimeElement.parentElement).toHaveTextContent('Build Time:');
  });

  it('displays IPNS hash when configured', () => {
    render(<BuildInfoOutput t={mockT} entry={mockEntry} />);

    expect(screen.getByText('IPNS Name:')).toBeInTheDocument();
    expect(
      screen.getByText(
        /k51qzi5uqu5dh5kbbff1ucw3ksphpy3vxx4en4dbtfh90pvw4mzd8nfm5r5fnl/,
      ),
    ).toBeInTheDocument();
  });

  it('handles missing environment variables gracefully', () => {
    vi.stubGlobal('process', {
      env: {},
    });

    render(<BuildInfoOutput t={mockT} entry={mockEntry} />);

    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
    expect(screen.getByText(/Not configured/)).toBeInTheDocument();
  });
});
