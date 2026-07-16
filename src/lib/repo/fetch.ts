import { toRawPath } from './path';

export const REPO_OWNER = 'nipsysdev';
export const REPO_NAME = 'site';

export interface ReadResult {
  ok: boolean;
  content?: string;
  /** true if detected binary */
  binary?: boolean;
  /** bytes received */
  size?: number;
  /** error message when ok === false */
  error?: string;
}

export function buildRawUrl(absPath: string, ref?: string): string {
  const resolvedRef = ref ?? process.env.BUILD_COMMIT ?? 'main';
  const rawPath = toRawPath(absPath);
  return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${resolvedRef}/${rawPath}`;
}

export function detectBinary(bytes: Uint8Array): boolean {
  const limit = Math.min(bytes.length, 8000);
  for (let i = 0; i < limit; i++) {
    if (bytes[i] === 0) return true;
  }
  return false;
}

const contentCache = new Map<string, ReadResult>();

export async function readRepoFile(absPath: string): Promise<ReadResult> {
  const cached = contentCache.get(absPath);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(buildRawUrl(absPath), {
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const size = bytes.byteLength;
    if (detectBinary(bytes)) {
      const result: ReadResult = { ok: true, binary: true, size };
      contentCache.set(absPath, result);
      return result;
    }
    const content = new TextDecoder('utf-8').decode(bytes);
    const result: ReadResult = { ok: true, content, size };
    contentCache.set(absPath, result);
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'fetch failed';
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
