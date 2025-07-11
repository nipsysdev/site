/**
 * Enhanced chunk loading with retry logic for IPFS deployments
 * This utility handles failed chunk loads and retries with exponential backoff
 */

interface ChunkRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryOn: (error: Error) => boolean;
}

interface WindowWithWebpack extends Window {
  __webpack_require__?: {
    e?: (chunkId: string) => Promise<unknown>;
  };
}

// Error patterns that should trigger retries
const RETRY_ERROR_NAMES = ['ChunkLoadError', 'NetworkError'];
const RETRY_ERROR_MESSAGES = ['Loading chunk', 'timeout', 'Failed to fetch'];

const DEFAULT_CONFIG: ChunkRetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOn: (error: Error) => {
    // Retry on network errors, timeouts, and chunk loading failures
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

  /**
   * Retry chunk loading with exponential backoff
   */
  async retryChunkLoad(
    chunkId: string,
    loadFn: () => Promise<unknown>,
    attempt: number = 0,
  ): Promise<unknown> {
    try {
      const result = await loadFn();
      // Clear successful attempts from tracking
      this.retryAttempts.delete(chunkId);
      return result;
    } catch (error) {
      const err = error as Error;

      if (!this.config.retryOn(err) || attempt >= this.config.maxRetries) {
        // Store final stats before clearing from active tracking
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

      console.warn(
        `Chunk loading failed for ${chunkId}, retrying in ${delay}ms (attempt ${
          attempt + 1
        }/${this.config.maxRetries})`,
        err,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryChunkLoad(chunkId, loadFn, attempt + 1);
    }
  }

  /**
   * Get retry statistics for monitoring
   */
  getRetryStats(): Record<string, number> {
    return {
      ...Object.fromEntries(this.retryAttempts.entries()),
      ...Object.fromEntries(this.finalStats.entries()),
    };
  }

  /**
   * Clear old statistics to prevent memory leaks
   */
  clearOldStats(): void {
    this.finalStats.clear();
  }
}

// Global instance
const chunkRetryManager = new ChunkRetryManager();

// Override the default chunk loading behavior
if (typeof window !== 'undefined') {
  const webpackWindow = window as WindowWithWebpack;

  // Override dynamic imports
  const originalDynamicImport = webpackWindow.__webpack_require__?.e;

  if (originalDynamicImport && webpackWindow.__webpack_require__) {
    const webpackReq = webpackWindow.__webpack_require__;
    webpackWindow.__webpack_require__.e = (chunkId: string) => {
      const loadChunk = () => originalDynamicImport.call(webpackReq, chunkId);

      return chunkRetryManager.retryChunkLoad(`chunk-${chunkId}`, loadChunk);
    };
  }

  // Handle script loading errors
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLScriptElement | null;
    if (target?.src) {
      const src = target.src;
      if (src.includes('_next/static/chunks/')) {
        console.error('Chunk loading error detected:', src, event.error);
        // The retry logic will be handled by the chunk loader
      }
    }
  });

  // Handle unhandled promise rejections from chunk loading
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message) {
      const message = event.reason.message;
      if (
        message.includes('Loading chunk') ||
        message.includes('ChunkLoadError')
      ) {
        console.error('Chunk loading rejection:', event.reason);
        // The retry logic will be handled by the chunk loader
      }
    }
  });
}

export { ChunkRetryManager, chunkRetryManager };
export type { ChunkRetryConfig };
