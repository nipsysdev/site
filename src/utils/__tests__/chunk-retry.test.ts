import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChunkRetryManager } from '../chunk-retry';

describe('ChunkRetryManager', () => {
  let manager: ChunkRetryManager;

  beforeEach(() => {
    manager = new ChunkRetryManager();
  });

  it('should retry chunk loading on failure', async () => {
    let attempts = 0;
    const mockLoadFn = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        const error = new Error('Loading chunk failed');
        error.name = 'ChunkLoadError';
        throw error;
      }
      return Promise.resolve('success');
    });

    const result = await manager.retryChunkLoad('test-chunk', mockLoadFn);

    expect(result).toBe('success');
    expect(mockLoadFn).toHaveBeenCalledTimes(3);
  });

  it('should not retry on non-retryable errors', async () => {
    const mockLoadFn = vi.fn().mockImplementation(() => {
      const error = new Error('Syntax error');
      error.name = 'SyntaxError';
      throw error;
    });

    await expect(
      manager.retryChunkLoad('test-chunk', mockLoadFn),
    ).rejects.toThrow('Syntax error');
    expect(mockLoadFn).toHaveBeenCalledTimes(1);
  });

  it('should use exponential backoff', async () => {
    const startTime = Date.now();
    const mockLoadFn = vi.fn().mockImplementation(() => {
      const error = new Error('Loading chunk failed');
      error.name = 'ChunkLoadError';
      throw error;
    });

    await expect(
      manager.retryChunkLoad('test-chunk', mockLoadFn),
    ).rejects.toThrow();

    const duration = Date.now() - startTime;
    // Should take at least 1000ms (first retry) + 2000ms (second retry) = 3000ms
    expect(duration).toBeGreaterThan(3000);
  }, 15000); // 15 second timeout

  it('should succeed on first try without retries', async () => {
    const mockLoadFn = vi.fn().mockResolvedValue('immediate success');

    const result = await manager.retryChunkLoad('test-chunk', mockLoadFn);

    expect(result).toBe('immediate success');
    expect(mockLoadFn).toHaveBeenCalledTimes(1);
    expect(manager.getRetryStats()).toEqual({});
  });
});
