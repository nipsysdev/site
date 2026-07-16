import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PwdOutput from '@/components/cmd-outputs/PwdOutput';
import { Command, type CommandEntry } from '@/types/terminal';

function makeEntry(overrides: Partial<CommandEntry> = {}): CommandEntry {
  return {
    timestamp: Date.now(),
    cmdName: Command.Pwd,
    args: { positional: [], flags: [], options: {} },
    rawInput: 'pwd',
    ...overrides,
  };
}

describe('PwdOutput', () => {
  it('prints the entry cwd when set', () => {
    render(<PwdOutput entry={makeEntry({ cwd: '/src' })} />);
    expect(screen.getByText('/src')).toBeInTheDocument();
  });

  it('defaults to root when cwd is missing', () => {
    render(<PwdOutput entry={makeEntry({ cwd: undefined })} />);
    expect(screen.getByText('/')).toBeInTheDocument();
  });
});
