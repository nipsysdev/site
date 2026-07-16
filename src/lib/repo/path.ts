/** Split an absolute VFS path into its non-empty segments. "/" -> []. "/src/app" -> ["src","app"] */
export function segments(absPath: string): string[] {
  return absPath.split('/').filter((s) => s.length > 0);
}

/**
 * Normalize an absolute path: collapse "//", resolve "." and ".."
 * (never above root). "/src/../app/./x" -> "/app/x". "/" -> "/"
 */
export function normalizePath(absPath: string): string {
  const segs = segments(absPath);
  const out: string[] = [];
  for (const seg of segs) {
    if (seg === '.') continue;
    if (seg === '..') {
      out.pop();
      continue;
    }
    out.push(seg);
  }
  return `/${out.join('/')}`;
}

/**
 * Resolve an input path against cwd. Handles: "~", "~/x" (home=root),
 * absolute "/x", relative, ".", "..". Empty input -> cwd.
 */
export function resolvePath(cwd: string, input: string): string {
  if (input === '') return cwd;
  let base: string;
  if (input.startsWith('~')) {
    let rest = input.slice(1);
    if (rest.startsWith('/')) rest = rest.slice(1);
    base = rest === '' ? '/' : `/${rest}`;
  } else if (input.startsWith('/')) {
    base = input;
  } else {
    base = `${cwd}/${input}`;
  }
  return normalizePath(base);
}

/** Parent of an absolute path. "/" -> "/". "/src" -> "/". "/src/app" -> "/src" */
export function parentPath(absPath: string): string {
  const segs = segments(absPath);
  if (segs.length === 0) return '/';
  segs.pop();
  return `/${segs.join('/')}`;
}

/** Basename. "/" -> "/". "/src/app" -> "app" */
export function basename(absPath: string): string {
  const segs = segments(absPath);
  if (segs.length === 0) return '/';
  return segs[segs.length - 1];
}

/** Convert absolute VFS path to repo-relative (strip leading slash). "/" -> "" */
export function toRawPath(absPath: string): string {
  return segments(absPath).join('/');
}
