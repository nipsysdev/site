import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CatOutput from '@/components/cmd-outputs/CatOutput';
import { type ReadResult, readRepoFile } from '@/lib/repo/fetch';
import type { RepoEntry } from '@/lib/repo/types';
import { createVfs } from '@/lib/repo/vfs';
import { $repoTree } from '@/stores/repo-store';
import { Command, type CommandEntry } from '@/types/terminal';

vi.mock('@/lib/repo/fetch', () => ({
  readRepoFile: vi.fn(),
  buildRawUrl: vi.fn(
    (absPath: string) => `https://raw.example${absPath}` as string,
  ),
}));

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

const mockedReadRepoFile = vi.mocked(readRepoFile);

function makeEntry(overrides: Partial<CommandEntry> = {}): CommandEntry {
  return {
    timestamp: Date.now(),
    cmdName: Command.Cat,
    args: { positional: [], flags: [], options: {} },
    rawInput: 'cat',
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

describe('CatOutput', () => {
  beforeEach(() => {
    seedRepoTree();
    mockedReadRepoFile.mockReset();
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

  it('renders a missing-operand error without fetching', () => {
    render(<CatOutput entry={makeEntry({ cwd: '/' })} />);

    expect(screen.getByText('cat: missing operand')).toBeInTheDocument();
    expect(mockedReadRepoFile).not.toHaveBeenCalled();
  });

  it('shows a loading message (not "…") while fetching a file', async () => {
    let resolveFetch!: (value: ReadResult) => void;
    mockedReadRepoFile.mockReturnValue(
      new Promise<ReadResult>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    render(
      <CatOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['README.md'], flags: [], options: {} },
        })}
      />,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();

    resolveFetch({ ok: true, content: 'done', size: 4 });
    expect(await screen.findByText('done')).toBeInTheDocument();
  });

  it('renders the file content for a text file', async () => {
    mockedReadRepoFile.mockResolvedValue({
      ok: true,
      content: 'hello world',
      size: 11,
    });

    render(
      <CatOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['README.md'], flags: [], options: {} },
        })}
      />,
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();
  });

  it('renders an error for a directory target without fetching', () => {
    render(
      <CatOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['src'], flags: [], options: {} },
        })}
      />,
    );

    expect(screen.getByText('cat: src: Is a directory')).toBeInTheDocument();
    expect(mockedReadRepoFile).not.toHaveBeenCalled();
  });

  it('renders a not-found error for a missing target', () => {
    render(
      <CatOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['nope'], flags: [], options: {} },
        })}
      />,
    );

    expect(
      screen.getByText('cat: nope: No such file or directory'),
    ).toBeInTheDocument();
    expect(mockedReadRepoFile).not.toHaveBeenCalled();
  });

  it('renders a binary notice with a raw link for binary files', async () => {
    mockedReadRepoFile.mockResolvedValue({
      ok: true,
      binary: true,
      size: 4096,
    });

    render(
      <CatOutput
        entry={makeEntry({
          cwd: '/',
          args: { positional: ['README.md'], flags: [], options: {} },
        })}
      />,
    );

    expect(await screen.findByText(/4096 bytes/)).toBeInTheDocument();
    const link = await screen.findByRole('link', { name: /view raw/ });
    expect(link).toHaveAttribute('href', 'https://raw.example/README.md');
    expect(mockedReadRepoFile).toHaveBeenCalledWith('/README.md');
  });
});
