import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface ChunkRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryOn: (error: Error) => boolean;
}

const RETRY_ERROR_NAMES = ['ChunkLoadError', 'NetworkError'];
const RETRY_ERROR_MESSAGES = ['Loading chunk', 'timeout', 'Failed to fetch'];

const DEFAULT_CONFIG: ChunkRetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOn: (error: Error) => {
    return (
      RETRY_ERROR_NAMES.includes(error.name) ||
      RETRY_ERROR_MESSAGES.some((msg) => error.message.includes(msg))
    );
  },
};

class ChunkRetryManager {
  private config: ChunkRetryConfig;
  private retryAttempts: Map<string, number> = new Map();
  private finalStats: Map<string, number> = new Map();

  constructor(config: Partial<ChunkRetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async retryChunkLoad(
    chunkId: string,
    loadFn: () => Promise<unknown>,
    attempt: number = 0,
  ): Promise<unknown> {
    try {
      const result = await loadFn();
      this.retryAttempts.delete(chunkId);
      return result;
    } catch (error) {
      const err = error as Error;

      if (!this.config.retryOn(err) || attempt >= this.config.maxRetries) {
        const finalAttempts = this.retryAttempts.get(chunkId) || 0;
        if (finalAttempts > 0) {
          this.finalStats.set(chunkId, finalAttempts);
        }
        this.retryAttempts.delete(chunkId);
        throw error;
      }

      const currentAttempts = this.retryAttempts.get(chunkId) || 0;
      this.retryAttempts.set(chunkId, currentAttempts + 1);

      const delay = Math.min(
        this.config.baseDelay * 2 ** attempt,
        this.config.maxDelay,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryChunkLoad(chunkId, loadFn, attempt + 1);
    }
  }

  getRetryStats(): Record<string, number> {
    return {
      ...Object.fromEntries(this.retryAttempts.entries()),
      ...Object.fromEntries(this.finalStats.entries()),
    };
  }

  clearOldStats(): void {
    this.finalStats.clear();
  }
}

describe('chunk-retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('ChunkRetryManager', () => {
    describe('constructor', () => {
      it('uses default config when no config provided', () => {
        const manager = new ChunkRetryManager();
        const stats = manager.getRetryStats();
        expect(stats).toEqual({});
      });

      it('merges custom config with defaults', () => {
        const manager = new ChunkRetryManager({ maxRetries: 5 });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockRejectedValueOnce(chunkError)
          .mockRejectedValueOnce(chunkError)
          .mockRejectedValueOnce(chunkError)
          .mockRejectedValueOnce(chunkError)
          .mockRejectedValueOnce(chunkError)
          .mockResolvedValueOnce('success');

        const resultPromise = manager.retryChunkLoad('test-chunk', loadFn);
        resultPromise.catch(() => {}); // Prevent unhandled rejection warning

        return vi.runAllTimersAsync().then(async () => {
          await expect(resultPromise).resolves.toBe('success');
          expect(loadFn).toHaveBeenCalledTimes(6); // 1 initial + 5 retries
        });
      });
    });

    describe('retryChunkLoad', () => {
      it('returns result immediately on successful load', async () => {
        const manager = new ChunkRetryManager();
        const loadFn = vi.fn().mockResolvedValue('chunk-data');

        const resultPromise = manager.retryChunkLoad('test-chunk', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBe('chunk-data');
        expect(loadFn).toHaveBeenCalledTimes(1);
      });

      it('does not retry on successful load', async () => {
        const manager = new ChunkRetryManager();
        const loadFn = vi.fn().mockResolvedValue('success');

        const resultPromise = manager.retryChunkLoad('chunk-1', loadFn);
        await vi.runAllTimersAsync();
        await resultPromise;

        expect(loadFn).toHaveBeenCalledTimes(1);
      });

      it('retries on ChunkLoadError', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockRejectedValueOnce(chunkError)
          .mockResolvedValueOnce('success');

        const resultPromise = manager.retryChunkLoad('chunk-2', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBe('success');
        expect(loadFn).toHaveBeenCalledTimes(2);
      });

      it('retries on NetworkError', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const networkError = new Error('Network failed');
        networkError.name = 'NetworkError';

        const loadFn = vi
          .fn()
          .mockRejectedValueOnce(networkError)
          .mockResolvedValueOnce('success');

        const resultPromise = manager.retryChunkLoad('chunk-3', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBe('success');
        expect(loadFn).toHaveBeenCalledTimes(2);
      });

      it('retries on error message containing "Loading chunk"', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const error = new Error('Loading chunk 123 failed');

        const loadFn = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const resultPromise = manager.retryChunkLoad('chunk-4', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBe('success');
        expect(loadFn).toHaveBeenCalledTimes(2);
      });

      it('retries on error message containing "timeout"', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const error = new Error('Request timeout exceeded');

        const loadFn = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const resultPromise = manager.retryChunkLoad('chunk-5', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBe('success');
        expect(loadFn).toHaveBeenCalledTimes(2);
      });

      it('retries on error message containing "Failed to fetch"', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const error = new Error('Failed to fetch resource');

        const loadFn = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const resultPromise = manager.retryChunkLoad('chunk-6', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBe('success');
        expect(loadFn).toHaveBeenCalledTimes(2);
      });

      it('does not retry on non-retryable errors', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const error = new Error('Some other error');

        let errorCaught = false;
        const loadFn = vi.fn().mockImplementation(() => Promise.reject(error));

        try {
          await manager.retryChunkLoad('chunk-7', loadFn);
        } catch (e) {
          errorCaught = true;
          expect((e as Error).message).toBe('Some other error');
        }

        expect(errorCaught).toBe(true);
        expect(loadFn).toHaveBeenCalledTimes(1);
      });

      it('throws after max retries exceeded', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 2,
          baseDelay: 100,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockImplementation(() => Promise.reject(chunkError));

        const resultPromise = manager.retryChunkLoad('chunk-8', loadFn);

        // Attach catch handler to prevent unhandled rejection warning
        resultPromise.catch(() => {});

        await vi.runAllTimersAsync();

        await expect(resultPromise).rejects.toThrow('Loading chunk failed');
        expect(loadFn).toHaveBeenCalledTimes(3);
      });

      it('uses exponential backoff for delays', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockImplementation(() => Promise.reject(chunkError));

        const resultPromise = manager.retryChunkLoad('chunk-9', loadFn);

        resultPromise.catch(() => {});

        await vi.advanceTimersByTimeAsync(999);
        expect(loadFn).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(loadFn).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(1999);
        expect(loadFn).toHaveBeenCalledTimes(2);
        await vi.advanceTimersByTimeAsync(1);
        expect(loadFn).toHaveBeenCalledTimes(3);

        await vi.advanceTimersByTimeAsync(3999);
        expect(loadFn).toHaveBeenCalledTimes(3);
        await vi.advanceTimersByTimeAsync(1);
        expect(loadFn).toHaveBeenCalledTimes(4);

        await vi.runAllTimersAsync();
        await expect(resultPromise).rejects.toThrow();
      });

      it('respects maxDelay cap', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 2000,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockImplementation(() => Promise.reject(chunkError));

        const resultPromise = manager.retryChunkLoad('chunk-10', loadFn);

        resultPromise.catch(() => {});

        await vi.runAllTimersAsync();

        await expect(resultPromise).rejects.toThrow();

        expect(loadFn).toHaveBeenCalledTimes(4);
      });

      it('succeeds after multiple retries', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 3,
          baseDelay: 100,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockRejectedValueOnce(chunkError)
          .mockRejectedValueOnce(chunkError)
          .mockResolvedValueOnce('success');

        const resultPromise = manager.retryChunkLoad('chunk-11', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBe('success');
        expect(loadFn).toHaveBeenCalledTimes(3);
      });
    });

    describe('getRetryStats', () => {
      it('returns empty object initially', () => {
        const manager = new ChunkRetryManager();
        expect(manager.getRetryStats()).toEqual({});
      });

      it('tracks retry attempts for active retries', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        let resolveRetry: (value: unknown) => void = () => {};
        const loadFn = vi.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            if (loadFn.mock.calls.length === 1) {
              reject(chunkError);
            } else {
              resolveRetry = resolve;
            }
          });
        });

        const resultPromise = manager.retryChunkLoad('chunk-stats', loadFn);

        await vi.advanceTimersByTimeAsync(100);

        expect(manager.getRetryStats()).toEqual({ 'chunk-stats': 1 });

        resolveRetry('success');
        await vi.runAllTimersAsync();
        await resultPromise;

        expect(manager.getRetryStats()).toEqual({});
      });

      it('preserves final stats after failure', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 2,
          baseDelay: 100,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockImplementation(() => Promise.reject(chunkError));

        const resultPromise = manager.retryChunkLoad('chunk-final', loadFn);

        resultPromise.catch(() => {});

        await vi.runAllTimersAsync();

        await expect(resultPromise).rejects.toThrow();

        expect(manager.getRetryStats()).toEqual({ 'chunk-final': 2 });
      });

      it('combines active and final stats', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 2,
          baseDelay: 100,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn1 = vi
          .fn()
          .mockImplementation(() => Promise.reject(chunkError));
        const resultPromise1 = manager.retryChunkLoad('chunk-1', loadFn1);
        resultPromise1.catch(() => {}); // Prevent unhandled rejection
        await vi.runAllTimersAsync();
        await expect(resultPromise1).rejects.toThrow();

        let resolveRetry2: (value: unknown) => void = () => {};
        const loadFn2 = vi.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            if (loadFn2.mock.calls.length === 1) {
              reject(chunkError);
            } else {
              resolveRetry2 = resolve;
            }
          });
        });
        const resultPromise2 = manager.retryChunkLoad('chunk-2', loadFn2);
        await vi.advanceTimersByTimeAsync(100);

        const stats = manager.getRetryStats();
        expect(stats).toEqual({
          'chunk-1': 2,
          'chunk-2': 1,
        });

        resolveRetry2('success');
        await vi.runAllTimersAsync();
        await resultPromise2;
      });
    });

    describe('clearOldStats', () => {
      it('clears final stats', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 1,
          baseDelay: 100,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockImplementation(() => Promise.reject(chunkError));
        const resultPromise = manager.retryChunkLoad('chunk-old', loadFn);
        resultPromise.catch(() => {}); // Prevent unhandled rejection
        await vi.runAllTimersAsync();
        await expect(resultPromise).rejects.toThrow();

        expect(manager.getRetryStats()).toEqual({ 'chunk-old': 1 });

        manager.clearOldStats();
        expect(manager.getRetryStats()).toEqual({});
      });

      it('does not affect active retries', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        let resolveRetry: (value: unknown) => void = () => {};
        const loadFn = vi.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            if (loadFn.mock.calls.length === 1) {
              reject(chunkError);
            } else {
              resolveRetry = resolve;
            }
          });
        });

        const resultPromise = manager.retryChunkLoad('chunk-active', loadFn);
        await vi.advanceTimersByTimeAsync(100);

        expect(manager.getRetryStats()).toEqual({ 'chunk-active': 1 });

        manager.clearOldStats();
        expect(manager.getRetryStats()).toEqual({ 'chunk-active': 1 });

        resolveRetry('success');
        await vi.runAllTimersAsync();
        await resultPromise;
      });
    });

    describe('custom retryOn function', () => {
      it('uses custom retryOn function', async () => {
        const manager = new ChunkRetryManager({
          baseDelay: 100,
          retryOn: (error) => error.message.includes('custom-retry'),
        });

        const retryableError = new Error('custom-retry error');
        const nonRetryableError = new Error('other error');

        const loadFn1 = vi
          .fn()
          .mockRejectedValueOnce(retryableError)
          .mockResolvedValueOnce('success');
        const result1 = manager.retryChunkLoad('chunk-custom-1', loadFn1);
        await vi.runAllTimersAsync();
        expect(await result1).toBe('success');
        expect(loadFn1).toHaveBeenCalledTimes(2);

        const loadFn2 = vi
          .fn()
          .mockImplementation(() => Promise.reject(nonRetryableError));
        const result2 = manager.retryChunkLoad('chunk-custom-2', loadFn2);
        result2.catch(() => {}); // Prevent unhandled rejection
        await vi.runAllTimersAsync();
        await expect(result2).rejects.toThrow('other error');
        expect(loadFn2).toHaveBeenCalledTimes(1);
      });
    });

    describe('edge cases', () => {
      it('handles concurrent chunk loads independently', async () => {
        const manager = new ChunkRetryManager({ baseDelay: 100 });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn1 = vi
          .fn()
          .mockRejectedValueOnce(chunkError)
          .mockResolvedValueOnce('chunk-a');
        const loadFn2 = vi
          .fn()
          .mockRejectedValueOnce(chunkError)
          .mockRejectedValueOnce(chunkError)
          .mockResolvedValueOnce('chunk-b');

        const result1Promise = manager.retryChunkLoad('chunk-a', loadFn1);
        const result2Promise = manager.retryChunkLoad('chunk-b', loadFn2);

        await vi.runAllTimersAsync();

        const [result1, result2] = await Promise.all([
          result1Promise,
          result2Promise,
        ]);

        expect(result1).toBe('chunk-a');
        expect(result2).toBe('chunk-b');
        expect(loadFn1).toHaveBeenCalledTimes(2);
        expect(loadFn2).toHaveBeenCalledTimes(3);
      });

      it('handles zero maxRetries', async () => {
        const manager = new ChunkRetryManager({
          maxRetries: 0,
          baseDelay: 100,
        });
        const chunkError = new Error('Loading chunk failed');
        chunkError.name = 'ChunkLoadError';

        const loadFn = vi
          .fn()
          .mockImplementation(() => Promise.reject(chunkError));

        const resultPromise = manager.retryChunkLoad('chunk-zero', loadFn);
        resultPromise.catch(() => {}); // Prevent unhandled rejection
        await vi.runAllTimersAsync();

        await expect(resultPromise).rejects.toThrow('Loading chunk failed');
        expect(loadFn).toHaveBeenCalledTimes(1);
      });

      it('handles undefined result from loadFn', async () => {
        const manager = new ChunkRetryManager();
        const loadFn = vi.fn().mockResolvedValue(undefined);

        const resultPromise = manager.retryChunkLoad('chunk-undefined', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBeUndefined();
        expect(loadFn).toHaveBeenCalledTimes(1);
      });

      it('handles null result from loadFn', async () => {
        const manager = new ChunkRetryManager();
        const loadFn = vi.fn().mockResolvedValue(null);

        const resultPromise = manager.retryChunkLoad('chunk-null', loadFn);
        await vi.runAllTimersAsync();
        const result = await resultPromise;

        expect(result).toBeNull();
        expect(loadFn).toHaveBeenCalledTimes(1);
      });
    });
  });
});
