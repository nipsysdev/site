import { RETRY_DELAY_MS } from './constants';
import { $connectionStatus, $error } from './stores';
import { cleanup, createAndStartNode, setWakuNode } from './waku-node';

let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;

export function clearRetryTimer(): void {
  retryCount = 0;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

export function scheduleRetry(): void {
  retryCount++;
  console.log(
    `[dpulse] Scheduling connection retry #${retryCount} in 5 seconds...`,
  );
  $connectionStatus.set('connecting');

  retryTimer = setTimeout(async () => {
    try {
      await attemptConnection();
    } catch (error) {
      console.error(`[dpulse] Retry #${retryCount} failed:`, error);
      scheduleRetry();
    }
  }, RETRY_DELAY_MS);
}

export async function attemptConnection(): Promise<void> {
  $connectionStatus.set('connecting');
  $error.set(null);
  console.log(`[dpulse] Attempting connection (retry #${retryCount})...`);

  await cleanup();

  const node = await createAndStartNode();
  setWakuNode(node);
}

export function getRetryCount(): number {
  return retryCount;
}
