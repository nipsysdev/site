import {
  basename,
  normalizePath,
  parentPath,
  segments,
  toRawPath,
} from './path';
import type { RepoEntry } from './types';

export interface Vfs {
  /** absolute path (leading /) -> entry. Root "/" always present as a synthetic tree entry. */
  nodes: Map<string, RepoEntry>;
  /** absolute dir path -> sorted array of child basenames */
  children: Map<string, string[]>;
}

/** Build a Vfs from repo-relative entries. Root "/" is always a tree. */
export function createVfs(entries: RepoEntry[]): Vfs {
  const nodes = new Map<string, RepoEntry>();
  const children = new Map<string, string[]>();

  // Seed root as a synthetic tree entry.
  nodes.set('/', { path: '', type: 'tree' });

  for (const entry of entries) {
    const key = normalizePath(`/${entry.path}`);
    nodes.set(key, { ...entry, path: toRawPath(key) });

    // Derive intermediate directory nodes so the tree is walkable even
    // when the source data omits explicit directory entries.
    const segs = segments(key);
    for (let i = 1; i < segs.length; i++) {
      const dirKey = `/${segs.slice(0, i).join('/')}`;
      if (!nodes.has(dirKey)) {
        nodes.set(dirKey, { path: toRawPath(dirKey), type: 'tree' });
      }
    }
  }

  // Build child index: parent abs path -> child basenames.
  for (const key of nodes.keys()) {
    if (key === '/') continue;
    const parent = parentPath(key);
    const name = basename(key);
    const arr = children.get(parent);
    if (arr) {
      arr.push(name);
    } else {
      children.set(parent, [name]);
    }
  }

  for (const arr of children.values()) {
    arr.sort();
  }

  return { nodes, children };
}

/** Get the entry at an absolute path, or undefined. Root "/" returns a synthetic tree entry. */
export function getNode(vfs: Vfs, absPath: string): RepoEntry | undefined {
  return vfs.nodes.get(normalizePath(absPath));
}

export function exists(vfs: Vfs, absPath: string): boolean {
  return getNode(vfs, absPath) !== undefined;
}

export function isDir(vfs: Vfs, absPath: string): boolean {
  const node = getNode(vfs, absPath);
  return node !== undefined && node.type === 'tree';
}

/**
 * List children of a directory as RepoEntry[]. Returns undefined if not a
 * directory. Sorted alphabetically by name.
 */
export function listDir(vfs: Vfs, absPath: string): RepoEntry[] | undefined {
  const norm = normalizePath(absPath);
  const node = vfs.nodes.get(norm);
  if (!node || node.type !== 'tree') return undefined;
  const names = vfs.children.get(norm) ?? [];
  return names
    .map((name) => vfs.nodes.get(normalizePath(`${norm}/${name}`)))
    .filter((n): n is RepoEntry => n !== undefined);
}
