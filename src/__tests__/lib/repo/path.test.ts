import { describe, expect, it } from 'vitest';
import {
  basename,
  normalizePath,
  parentPath,
  resolvePath,
  segments,
  toRawPath,
} from '@/lib/repo/path';

describe('segments', () => {
  it('returns [] for root', () => {
    expect(segments('/')).toEqual([]);
  });

  it('splits a normal path', () => {
    expect(segments('/src/app')).toEqual(['src', 'app']);
  });

  it('collapses empty segments', () => {
    expect(segments('//a//b/')).toEqual(['a', 'b']);
  });

  it('returns [] for empty string', () => {
    expect(segments('')).toEqual([]);
  });
});

describe('normalizePath', () => {
  it('resolves "." and ".."', () => {
    expect(normalizePath('/src/../app/./x')).toBe('/app/x');
  });

  it('never goes above root', () => {
    expect(normalizePath('/a/../../b')).toBe('/b');
  });

  it('collapses duplicate slashes', () => {
    expect(normalizePath('//x//')).toBe('/x');
  });

  it('keeps root as root', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('resolves a deeply nested relative climb', () => {
    expect(normalizePath('/a/b/c/../../d')).toBe('/a/d');
  });
});

describe('resolvePath', () => {
  it('resolves a relative input against cwd', () => {
    expect(resolvePath('/src', 'app')).toBe('/src/app');
  });

  it('"." resolves to cwd', () => {
    expect(resolvePath('/src', '.')).toBe('/src');
  });

  it('".." resolves to parent', () => {
    expect(resolvePath('/src/app', '..')).toBe('/src');
  });

  it('"~" resolves to root', () => {
    expect(resolvePath('/src', '~')).toBe('/');
  });

  it('"~/x" resolves to a root-relative path', () => {
    expect(resolvePath('/src', '~/lib')).toBe('/lib');
  });

  it('"~/" resolves to root', () => {
    expect(resolvePath('/src', '~/')).toBe('/');
  });

  it('absolute input ignores cwd', () => {
    expect(resolvePath('/src', '/lib')).toBe('/lib');
  });

  it('empty input returns cwd', () => {
    expect(resolvePath('/src', '')).toBe('/src');
  });

  it('resolves nested relative input', () => {
    expect(resolvePath('/src/app', '../../lib')).toBe('/lib');
  });
});

describe('parentPath', () => {
  it('returns "/" for root', () => {
    expect(parentPath('/')).toBe('/');
  });

  it('returns "/" for a top-level dir', () => {
    expect(parentPath('/src')).toBe('/');
  });

  it('returns the parent for nested paths', () => {
    expect(parentPath('/src/app')).toBe('/src');
  });
});

describe('basename', () => {
  it('returns "/" for root', () => {
    expect(basename('/')).toBe('/');
  });

  it('returns the last segment', () => {
    expect(basename('/src/app')).toBe('app');
  });

  it('returns the file name', () => {
    expect(basename('/file.ts')).toBe('file.ts');
  });
});

describe('toRawPath', () => {
  it('strips the leading slash', () => {
    expect(toRawPath('/src/app/page.tsx')).toBe('src/app/page.tsx');
  });

  it('returns "" for root', () => {
    expect(toRawPath('/')).toBe('');
  });
});
