import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildRawUrl, detectBinary } from '@/lib/repo/fetch';

describe('buildRawUrl', () => {
  const originalCommit = process.env.BUILD_COMMIT;

  afterEach(() => {
    if (originalCommit === undefined) {
      delete process.env.BUILD_COMMIT;
    } else {
      process.env.BUILD_COMMIT = originalCommit;
    }
  });

  it('uses an explicit ref', () => {
    expect(buildRawUrl('/src/app/page.tsx', 'main')).toBe(
      'https://raw.githubusercontent.com/nipsysdev/site/main/src/app/page.tsx',
    );
  });

  it('falls back to BUILD_COMMIT when ref is omitted', () => {
    process.env.BUILD_COMMIT = 'abc1234';
    expect(buildRawUrl('/src/app/page.tsx')).toBe(
      'https://raw.githubusercontent.com/nipsysdev/site/abc1234/src/app/page.tsx',
    );
  });

  it('falls back to main when neither ref nor BUILD_COMMIT is set', () => {
    delete process.env.BUILD_COMMIT;
    expect(buildRawUrl('/README.md')).toBe(
      'https://raw.githubusercontent.com/nipsysdev/site/main/README.md',
    );
  });

  it('handles root path', () => {
    expect(buildRawUrl('/', 'main')).toBe(
      'https://raw.githubusercontent.com/nipsysdev/site/main/',
    );
  });
});

describe('detectBinary', () => {
  it('returns false for plain text', () => {
    expect(detectBinary(new Uint8Array([72, 101, 108, 108, 111]))).toBe(false);
  });

  it('returns true when a NUL byte is present', () => {
    expect(detectBinary(new Uint8Array([0, 72, 101]))).toBe(true);
  });

  it('returns true for a NUL within the 8000-byte window', () => {
    const bytes = new Uint8Array(8001).fill(1);
    bytes[7999] = 0;
    expect(detectBinary(bytes)).toBe(true);
  });

  it('returns false for a NUL beyond the 8000-byte window', () => {
    const bytes = new Uint8Array(8001).fill(1);
    bytes[8000] = 0;
    expect(detectBinary(bytes)).toBe(false);
  });

  it('returns false for an empty array', () => {
    expect(detectBinary(new Uint8Array(0))).toBe(false);
  });
});

describe('readRepoFile', () => {
  beforeEach(() => {
    // Reset module registry so the module-level cache is fresh per test.
    vi.resetModules();
    delete process.env.BUILD_COMMIT;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns decoded text for a text file', async () => {
    const text = 'export const x = 1;';
    const bytes = new TextEncoder().encode(text);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: async () => bytes.buffer,
      }),
    );
    const { readRepoFile } = await import('@/lib/repo/fetch');

    const result = await readRepoFile('/src/index.ts');

    expect(result).toEqual({ ok: true, content: text, size: bytes.byteLength });
  });

  it('returns binary:true without content for a binary file', async () => {
    const bytes = new Uint8Array([72, 0, 108]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: async () => bytes.buffer,
      }),
    );
    const { readRepoFile } = await import('@/lib/repo/fetch');

    const result = await readRepoFile('/img/logo.png');

    expect(result).toEqual({ ok: true, binary: true, size: 3 });
    expect(result.content).toBeUndefined();
  });

  it('caches results: a second call does not invoke fetch again', async () => {
    const text = 'cached content';
    const bytes = new TextEncoder().encode(text);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => bytes.buffer,
    });
    vi.stubGlobal('fetch', fetchMock);
    const { readRepoFile } = await import('@/lib/repo/fetch');

    const first = await readRepoFile('/src/cached.ts');
    const second = await readRepoFile('/src/cached.ts');

    expect(first.content).toBe(text);
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns an error (and does not cache) on HTTP 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      arrayBuffer: async () => new ArrayBuffer(0),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { readRepoFile } = await import('@/lib/repo/fetch');

    const result = await readRepoFile('/missing.ts');

    expect(result).toEqual({ ok: false, error: 'HTTP 404' });

    // Not cached: a second call should hit fetch again.
    await readRepoFile('/missing.ts');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never throws: a rejecting fetch resolves to ok:false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );
    const { readRepoFile } = await import('@/lib/repo/fetch');

    const result = await readRepoFile('/src/whatever.ts');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('network down');
  });

  it('never throws: an abort resolves to ok:false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url, opts) => {
        opts.signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
        });
        return Promise.reject(new Error('The operation was aborted'));
      }),
    );
    const { readRepoFile } = await import('@/lib/repo/fetch');

    const result = await readRepoFile('/src/aborted.ts');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('The operation was aborted');
  });
});
