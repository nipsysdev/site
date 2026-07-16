import { atom, onMount } from 'nanostores';
import { resolvePath } from '@/lib/repo/path';
import type { RepoTreeData } from '@/lib/repo/types';
import { createVfs, exists, isDir, type Vfs } from '@/lib/repo/vfs';

export interface RepoState {
  vfs: Vfs | null;
  commit: string | null;
  loading: boolean;
  error: string | null;
}

export const $repoTree = atom<RepoState>({
  vfs: null,
  commit: null,
  loading: true,
  error: null,
});

export const $cwd = atom<string>('/');

onMount($repoTree, () => {
  let aborted = false;
  (async () => {
    try {
      const res = await fetch('/repo-tree.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as RepoTreeData;
      if (aborted) return;
      $repoTree.set({
        vfs: createVfs(data.entries),
        commit: data.commit,
        loading: false,
        error: null,
      });
    } catch (e) {
      if (aborted) return;
      $repoTree.set({
        vfs: null,
        commit: null,
        loading: false,
        error: e instanceof Error ? e.message : 'failed to load repo tree',
      });
    }
  })();
  return () => {
    aborted = true;
  };
});

export interface ChangeDirResult {
  ok: boolean;
  error?: string;
}

/** Resolve & validate a cd target against the current cwd. Sets $cwd on success. Does NOT format the 'cd:' prefix — the caller does. */
export function changeDirectory(arg: string): ChangeDirResult {
  const { vfs } = $repoTree.get();
  if (!vfs) {
    return { ok: false, error: 'filesystem not ready' };
  }
  const cwd = $cwd.get();
  const trimmed = arg.trim();
  const target = trimmed === '' ? '/' : resolvePath(cwd, trimmed);
  if (!exists(vfs, target)) {
    return { ok: false, error: `no such file or directory: ${trimmed}` };
  }
  if (!isDir(vfs, target)) {
    return { ok: false, error: `not a directory: ${trimmed}` };
  }
  $cwd.set(target);
  return { ok: true };
}
