import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useIsPrerender from '@/hooks/useIsPrerender';

describe('useIsPrerender', () => {
  it('should return false in test environment (effects run immediately)', () => {
    const { result } = renderHook(() => useIsPrerender());

    // In test environment, useEffect runs immediately, so isPrerender is false
    expect(result.current).toBe(false);
  });
});
