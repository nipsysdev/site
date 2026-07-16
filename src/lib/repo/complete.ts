import { resolvePath } from '@/lib/repo/path';
import type { RepoEntry } from '@/lib/repo/types';
import type { Vfs } from '@/lib/repo/vfs';
import { isDir, listDir } from '@/lib/repo/vfs';

export type CompletionKind = 'all' | 'dir';

export interface PathCompletion {
  /** Full token to insert when exactly one candidate matches; undefined otherwise. */
  completed?: string;
  /** Candidate names (basename of each match) for the suggestions list. */
  suggestions: string[];
}

function nameOf(entry: RepoEntry): string {
  const segments = entry.path.split('/');
  return segments[segments.length - 1] ?? entry.path;
}

export function completePath(
  vfs: Vfs,
  cwd: string,
  token: string,
  kind: CompletionKind = 'all',
): PathCompletion {
  const lastSlash = token.lastIndexOf('/');
  const dirPart = lastSlash >= 0 ? token.slice(0, lastSlash) : '';
  const prefix = lastSlash >= 0 ? token.slice(lastSlash + 1) : token;

  const dirAbs = dirPart === '' ? cwd : resolvePath(cwd, dirPart);
  if (!isDir(vfs, dirAbs)) {
    return { suggestions: [] };
  }

  const entries = (listDir(vfs, dirAbs) ?? []).filter((entry) =>
    kind === 'dir' ? entry.type === 'tree' : true,
  );
  const matches = entries.filter((entry) => nameOf(entry).startsWith(prefix));

  if (matches.length === 0) {
    return { suggestions: [] };
  }
  if (matches.length === 1) {
    const name = nameOf(matches[0]);
    const trailing = matches[0].type === 'tree' ? '/' : '';
    return {
      completed: `${dirPart ? `${dirPart}/` : ''}${name}${trailing}`,
      suggestions: [`${name}${trailing}`],
    };
  }
  return { suggestions: matches.map(nameOf) };
}
