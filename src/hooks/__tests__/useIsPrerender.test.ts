import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import useIsPrerender from '@/hooks/useIsPrerender';

describe('useIsPrerender', () => {
  it('should return false in test environment (effects run immediately)', () => {
    const { result } = renderHook(() => useIsPrerender());
    
    // In test environment, useEffect runs immediately, so isPrerender is false
    expect(result.current).toBe(false);
  });

  it('should remain false after rerender', () => {
    const { result, rerender } = renderHook(() => useIsPrerender());
    
    // Initially false in test environment
    expect(result.current).toBe(false);
    
    // Still false after rerender
    rerender();
    expect(result.current).toBe(false);
  });

  it('should not change value after initial effect', () => {
    const { result, rerender } = renderHook(() => useIsPrerender());
    
    const initialValue = result.current;
    
    // Rerender multiple times
    rerender();
    rerender();
    rerender();
    
    // Value should remain the same
    expect(result.current).toBe(initialValue);
  });

  it('should handle multiple instances independently', () => {
    const { result: result1 } = renderHook(() => useIsPrerender());
    const { result: result2 } = renderHook(() => useIsPrerender());
    
    // Both should be false in test environment
    expect(result1.current).toBe(false);
    expect(result2.current).toBe(false);
  });
});
