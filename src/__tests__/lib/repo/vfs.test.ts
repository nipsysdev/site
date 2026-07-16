import { describe, expect, it } from 'vitest';
import type { RepoEntry } from '@/lib/repo/types';
import { createVfs, exists, getNode, isDir, listDir } from '@/lib/repo/vfs';

const SAMPLE: RepoEntry[] = [
  { path: 'README.md', type: 'blob', size: 100 },
  { path: 'src/index.ts', type: 'blob', size: 42 },
  { path: 'src/app/page.tsx', type: 'blob', size: 256 },
  { path: 'a/b/c.txt', type: 'blob', size: 7 },
];

describe('createVfs', () => {
  it('builds nodes for root, all entries, and derived dirs', () => {
    const vfs = createVfs(SAMPLE);

    expect(getNode(vfs, '/')?.type).toBe('tree');
    expect(getNode(vfs, '/src')?.type).toBe('tree');
    expect(getNode(vfs, '/src/app')?.type).toBe('tree');
    expect(getNode(vfs, '/src/index.ts')).toEqual({
      path: 'src/index.ts',
      type: 'blob',
      size: 42,
    });
    expect(getNode(vfs, '/a')?.type).toBe('tree');
    expect(getNode(vfs, '/a/b')?.type).toBe('tree');
    expect(getNode(vfs, '/a/b/c.txt')).toEqual({
      path: 'a/b/c.txt',
      type: 'blob',
      size: 7,
    });
  });

  it('returns undefined for unknown paths', () => {
    const vfs = createVfs(SAMPLE);
    expect(getNode(vfs, '/nope')).toBeUndefined();
  });

  it('still has a root with empty entries', () => {
    const vfs = createVfs([]);
    expect(getNode(vfs, '/')?.type).toBe('tree');
    expect(exists(vfs, '/')).toBe(true);
  });
});

describe('exists', () => {
  const vfs = createVfs(SAMPLE);

  it('returns true for present nodes', () => {
    expect(exists(vfs, '/')).toBe(true);
    expect(exists(vfs, '/src')).toBe(true);
    expect(exists(vfs, '/README.md')).toBe(true);
  });

  it('returns false for missing nodes', () => {
    expect(exists(vfs, '/missing')).toBe(false);
  });
});

describe('isDir', () => {
  const vfs = createVfs(SAMPLE);

  it('returns true for tree nodes', () => {
    expect(isDir(vfs, '/')).toBe(true);
    expect(isDir(vfs, '/src')).toBe(true);
    expect(isDir(vfs, '/src/app')).toBe(true);
  });

  it('returns false for blob nodes', () => {
    expect(isDir(vfs, '/README.md')).toBe(false);
  });

  it('returns false for missing nodes', () => {
    expect(isDir(vfs, '/missing')).toBe(false);
  });
});

describe('listDir', () => {
  const vfs = createVfs(SAMPLE);

  it('lists root children sorted alphabetically', () => {
    const entries = listDir(vfs, '/');
    expect(entries?.map((e) => e.path)).toEqual(['README.md', 'a', 'src']);
  });

  it('lists a nested dir sorted alphabetically', () => {
    const entries = listDir(vfs, '/src');
    expect(entries?.map((e) => e.path)).toEqual(['src/app', 'src/index.ts']);
    expect(entries?.find((e) => e.path === 'src/app')?.type).toBe('tree');
    expect(entries?.find((e) => e.path === 'src/index.ts')?.type).toBe('blob');
  });

  it('returns undefined for a file path (not a dir)', () => {
    expect(listDir(vfs, '/src/index.ts')).toBeUndefined();
  });

  it('returns undefined for a missing path', () => {
    expect(listDir(vfs, '/missing')).toBeUndefined();
  });

  it('returns [] (not undefined) for an empty root', () => {
    const vfs = createVfs([]);
    expect(listDir(vfs, '/')).toEqual([]);
  });

  it('returns [] for a dir with no children', () => {
    // /a/b/c.txt exists but /a/b has only c.txt as a child -> not empty.
    // Verify a leaf dir lists its single child.
    expect(listDir(vfs, '/a/b')?.map((e) => e.path)).toEqual(['a/b/c.txt']);
  });
});
