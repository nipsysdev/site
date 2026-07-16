import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RepoEntry } from '@/lib/repo/types';
import { createVfs, getNode } from '@/lib/repo/vfs';
import { $cwd, $repoTree, changeDirectory } from '@/stores/repo-store';

const SAMPLE_ENTRIES: RepoEntry[] = [
  { path: 'README.md', type: 'blob', size: 10 },
  { path: 'src/index.ts', type: 'blob', size: 5 },
  { path: 'src/app/page.tsx', type: 'blob', size: 7 },
];

describe('repo-store', () => {
  describe('$cwd default', () => {
    it('defaults to root', () => {
      expect($cwd.get()).toBe('/');
    });
  });

  describe('changeDirectory', () => {
    beforeEach(() => {
      $repoTree.set({
        vfs: createVfs(SAMPLE_ENTRIES),
        commit: 'abc',
        loading: false,
        error: null,
      });
      $cwd.set('/');
    });

    it('moves into a top-level directory', () => {
      const result = changeDirectory('src');
      expect(result).toEqual({ ok: true });
      expect($cwd.get()).toBe('/src');
    });

    it('resolves relative paths against the current cwd', () => {
      changeDirectory('src');
      const result = changeDirectory('app');
      expect(result).toEqual({ ok: true });
      expect($cwd.get()).toBe('/src/app');
    });

    it('resolves ".. to the parent directory', () => {
      changeDirectory('src');
      changeDirectory('app');
      const result = changeDirectory('..');
      expect(result).toEqual({ ok: true });
      expect($cwd.get()).toBe('/src');
    });

    it('fails for a nonexistent target and leaves cwd unchanged', () => {
      changeDirectory('src');
      const result = changeDirectory('nonexistent');
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/no such file or directory/);
      expect($cwd.get()).toBe('/src');
    });

    it('fails when the target is a file (not a directory)', () => {
      const result = changeDirectory('README.md');
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/not a directory/);
      expect($cwd.get()).toBe('/');
    });

    it('goes home on empty argument from anywhere', () => {
      changeDirectory('src');
      changeDirectory('app');
      const result = changeDirectory('');
      expect(result).toEqual({ ok: true });
      expect($cwd.get()).toBe('/');
    });

    it('returns filesystem not ready when vfs is null', () => {
      $repoTree.set({
        vfs: null,
        commit: null,
        loading: false,
        error: null,
      });
      const result = changeDirectory('src');
      expect(result).toEqual({ ok: false, error: 'filesystem not ready' });
      expect($cwd.get()).toBe('/');
    });
  });

  describe('onMount load', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.resetModules();
    });

    it('loads the vfs when the first subscriber attaches', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          json: async () => ({
            owner: 'nipsysdev',
            name: 'site',
            commit: 'abc',
            entries: [{ path: 'README.md', type: 'blob', size: 10 }],
          }),
        })),
      );
      vi.resetModules();
      const { $repoTree } = await import('@/stores/repo-store');
      $repoTree.listen(() => {});

      await vi.waitFor(() => {
        expect($repoTree.get().loading).toBe(false);
      });
      const state = $repoTree.get();
      expect(state.commit).toBe('abc');
      expect(state.error).toBeNull();
      expect(state.vfs).not.toBeNull();
      expect(getNode(state.vfs as never, '/README.md')).toBeDefined();
    });

    it('sets an error and leaves vfs null when fetch fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('network down');
        }),
      );
      vi.resetModules();
      const { $repoTree } = await import('@/stores/repo-store');
      $repoTree.listen(() => {});

      await vi.waitFor(() => {
        expect($repoTree.get().loading).toBe(false);
      });
      const state = $repoTree.get();
      expect(state.error).not.toBeNull();
      expect(state.vfs).toBeNull();
      expect(state.loading).toBe(false);
    });

    it('sets an error on a non-ok HTTP response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: false, status: 404 })),
      );
      vi.resetModules();
      const { $repoTree } = await import('@/stores/repo-store');
      $repoTree.listen(() => {});

      await vi.waitFor(() => {
        expect($repoTree.get().loading).toBe(false);
      });
      const state = $repoTree.get();
      expect(state.error).toMatch(/HTTP 404/);
      expect(state.vfs).toBeNull();
    });
  });
});
