import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LsOutput from '@/components/cmd-outputs/LsOutput';
import type { RepoEntry } from '@/lib/repo/types';
import { createVfs } from '@/lib/repo/vfs';
import { $repoTree } from '@/stores/repo-store';
import { Command, type CommandEntry } from '@/types/terminal';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

const SAMPLE_ENTRIES: RepoEntry[] = [
  { path: 'README.md', type: 'blob', size: 100 },
  { path: '.gitignore', type: 'blob', size: 20 },
  { path: 'src/index.ts', type: 'blob', size: 5 },
  { path: 'src/app/page.tsx', type: 'blob', size: 7 },
  { path: 'package.json', type: 'blob', size: 50 },
];

function makeEntry(overrides: Partial<CommandEntry> = {}): CommandEntry {
  return {
    timestamp: Date.now(),
    cmdName: Command.Ls,
    args: { positional: [], flags: [], options: {} },
    rawInput: 'ls',
    ...overrides,
  };
}

function seedRepoTree(entries: RepoEntry[] = SAMPLE_ENTRIES) {
  $repoTree.set({
    vfs: createVfs(entries),
    commit: 'abc',
    loading: false,
    error: null,
  });
}

describe('LsOutput', () => {
  beforeEach(() => {
    seedRepoTree();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          owner: 'nipsysdev',
          name: 'site',
          commit: 'abc',
          entries: SAMPLE_ENTRIES,
        }),
      })),
    );
  });

  afterEach(() => {
    cleanup();
    $repoTree.set({ vfs: null, commit: null, loading: true, error: null });
    vi.unstubAllGlobals();
  });

  it('lists top-level entries and hides dotfiles by default', () => {
    render(<LsOutput entry={makeEntry({ cwd: '/' })} />);

    expect(screen.getByText('README.md')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.queryByText('.gitignore')).not.toBeInTheDocument();
  });

  it('includes dotfiles with the -a flag', () => {
    render(
      <LsOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: [], flags: ['a'], options: {} },
        })}
      />,
    );

    expect(screen.getByText('.gitignore')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
  });

  it('lists the contents of a subdirectory', () => {
    render(
      <LsOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['src'], flags: [], options: {} },
        })}
      />,
    );

    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('app')).toBeInTheDocument();
  });

  it('renders long format with sizes, one row per entry', () => {
    const { container } = render(
      <LsOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: [], flags: ['l'], options: {} },
        })}
      />,
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
    // 3 visible top-level entries (README.md, package.json, src) => 3 rows
    expect(container.firstElementChild?.children.length).toBe(3);
  });

  it('renders an error for a nonexistent target', () => {
    render(
      <LsOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['nope'], flags: [], options: {} },
        })}
      />,
    );

    expect(
      screen.getByText(/cannot access 'nope': No such file or directory/),
    ).toBeInTheDocument();
  });

  it('renders just the name when the target is a file', () => {
    const { container } = render(
      <LsOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['README.md'], flags: [], options: {} },
        })}
      />,
    );

    expect(screen.getByText('README.md')).toBeInTheDocument();
    // A single element (the name), not a directory listing.
    expect(container.firstElementChild?.children.length).toBe(0);
  });

  it('renders a loading indicator while the vfs loads', () => {
    $repoTree.set({ vfs: null, commit: null, loading: true, error: null });
    render(<LsOutput entry={makeEntry({ cwd: '/' })} />);
    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('renders a destructive message when the filesystem is unavailable', () => {
    $repoTree.set({ vfs: null, commit: null, loading: false, error: 'boom' });
    render(<LsOutput entry={makeEntry({ cwd: '/' })} />);
    expect(screen.getByText('ls: filesystem unavailable')).toBeInTheDocument();
  });
});
