const { execSync } = require('node:child_process');
const fs = require('node:fs');

const REPO_OWNER = 'nipsysdev';
const REPO_NAME = 'site';
const OUT_FILE = 'public/repo-tree.json';
const EXCLUDE_PREFIXES = ['external/']; // submodule — separate repo

function getCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

function listFiles() {
  // git ls-tree -r -l HEAD outputs: "<mode> <type> <sha> <size>\t<path>"
  // type is 'blob' for files; size is the byte size or '-' for non-blobs.
  try {
    const out = execSync('git ls-tree -r -l HEAD', { encoding: 'utf-8' });
    const files = [];
    for (const line of out.split('\n')) {
      if (!line.trim()) continue;
      const tabIdx = line.indexOf('\t');
      if (tabIdx === -1) continue;
      const meta = line.slice(0, tabIdx).trim();
      const filePath = line.slice(tabIdx + 1);
      if (!filePath) continue;
      if (EXCLUDE_PREFIXES.some((p) => filePath.startsWith(p))) continue;
      const [, type, , sizeStr] = meta.split(/\s+/);
      if (type !== 'blob') continue; // skip submodule 'commit' entries etc.
      const size = sizeStr && sizeStr !== '-' ? Number(sizeStr) : undefined;
      files.push({ path: filePath, type: 'blob', size });
    }
    return files;
  } catch (e) {
    console.error(
      'generate-file-index: failed to list files via git:',
      e.message,
    );
    return [];
  }
}

function deriveDirs(files) {
  const dirs = new Set();
  for (const f of files) {
    const parts = f.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join('/'));
    }
  }
  return [...dirs].map((d) => ({ path: d, type: 'tree' }));
}

const commit = getCommit();
const files = listFiles();
const dirs = deriveDirs(files);
const entries = [...files, ...dirs].sort((a, b) =>
  a.path.localeCompare(b.path),
);

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync(
  OUT_FILE,
  JSON.stringify(
    { owner: REPO_OWNER, name: REPO_NAME, commit, entries },
    null,
    2,
  ),
);
console.log(
  `Generated ${OUT_FILE}: ${files.length} files, ${dirs.length} dirs (commit ${commit})`,
);
