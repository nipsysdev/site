import { describe, expect, it } from 'vitest';
import { completePath } from '@/lib/repo/complete';
import type { RepoEntry } from '@/lib/repo/types';
import { createVfs } from '@/lib/repo/vfs';

const entries: RepoEntry[] = [
  { path: 'README.md', type: 'blob', size: 100 },
  { path: '.gitignore', type: 'blob', size: 10 },
  { path: 'package.json', type: 'blob', size: 50 },
  { path: 'src', type: 'tree' },
  { path: 'src/index.ts', type: 'blob', size: 20 },
  { path: 'src/app', type: 'tree' },
  { path: 'src/app/page.tsx', type: 'blob', size: 30 },
  { path: 'src/lib', type: 'tree' },
];
const vfs = createVfs(entries);

describe('completePath', () => {
  describe('single match', () => {
    it('completes a unique file at root', () => {
      const result = completePath(vfs, '/', 'READ');
      expect(result.completed).toBe('README.md');
      expect(result.suggestions).toEqual(['README.md']);
    });

    it('completes a unique directory with a trailing slash', () => {
      const result = completePath(vfs, '/', 'sr');
      expect(result.completed).toBe('src/');
      expect(result.suggestions).toEqual(['src/']);
    });

    it('preserves the user-typed directory part', () => {
      const result = completePath(vfs, '/', 'src/in');
      expect(result.completed).toBe('src/index.ts');
    });

    it('completes inside a subdirectory relative to cwd', () => {
      const result = completePath(vfs, '/src', 'ap');
      expect(result.completed).toBe('app/');
    });

    it('resolves a relative directory part (..)', () => {
      const result = completePath(vfs, '/src/app', '../li');
      expect(result.completed).toBe('../lib/');
    });

    it('expands ~ to root', () => {
      const result = completePath(vfs, '/src', '~/sr');
      expect(result.completed).toBe('~/src/');
    });

    it('includes dotfiles in completion', () => {
      const result = completePath(vfs, '/', '.git');
      expect(result.completed).toBe('.gitignore');
    });
  });

  describe('multiple matches', () => {
    it('returns candidate names without completed', () => {
      const result = completePath(vfs, '/', 'src/');
      expect(result.completed).toBeUndefined();
      expect(result.suggestions).toEqual(
        expect.arrayContaining(['app', 'index.ts', 'lib']),
      );
    });

    it('lists all children when prefix is empty', () => {
      const result = completePath(vfs, '/src', '');
      expect(result.completed).toBeUndefined();
      expect(result.suggestions.length).toBe(3);
    });
  });

  describe('no matches', () => {
    it('returns an empty suggestion list for an unknown prefix', () => {
      const result = completePath(vfs, '/', 'zzz');
      expect(result.completed).toBeUndefined();
      expect(result.suggestions).toEqual([]);
    });

    it('returns empty when the directory part is not a directory', () => {
      const result = completePath(vfs, '/', 'README.md/foo');
      expect(result.suggestions).toEqual([]);
    });
  });

  describe('kind = dir (cd)', () => {
    it('completes a directory', () => {
      const result = completePath(vfs, '/src', '', 'dir');
      expect(result.suggestions).toEqual(
        expect.arrayContaining(['app', 'lib']),
      );
      expect(result.suggestions).not.toContain('index.ts');
    });

    it('excludes files entirely', () => {
      const result = completePath(vfs, '/src', 'index', 'dir');
      expect(result.suggestions).toEqual([]);
    });

    it('completes a single directory with trailing slash', () => {
      const result = completePath(vfs, '/', 'sr', 'dir');
      expect(result.completed).toBe('src/');
    });
  });
});
