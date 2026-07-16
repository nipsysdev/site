export type RepoEntryType = 'blob' | 'tree';

export interface RepoEntry {
  /** Repo-relative path, no leading slash, e.g. "src/app/page.tsx" */
  path: string;
  type: RepoEntryType;
  /** Size in bytes (blobs only) */
  size?: number;
}

export interface RepoTreeData {
  owner: string;
  name: string;
  commit: string;
  entries: RepoEntry[];
}
