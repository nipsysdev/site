import { clearRetryTimer, scheduleRetry } from './retry-manager';
import {
  $connectionStatus,
  $error,
  $isLoading,
  $statusMessages,
} from './stores';
import { cleanup, createAndStartNode, setWakuNode } from './waku-node';

export async function initWaku(): Promise<void> {
  clearRetryTimer();

  await cleanup();

  try {
    $connectionStatus.set('connecting');
    $error.set(null);
    $isLoading.set(true);
    console.log('[dpulse] Creating Waku node...');

    const node = await createAndStartNode();
    setWakuNode(node);
  } catch (error) {
    console.error('[dpulse] Failed to start:', error);
    const errorMsg =
      error instanceof Error ? error.message : 'Failed to start subscription';
    setError(errorMsg);
    scheduleRetry();
  } finally {
    $isLoading.set(false);
  }
}

export async function shutdownWaku(): Promise<void> {
  console.log('[dpulse] Shutting down...');
  clearRetryTimer();
  await cleanup();
  $connectionStatus.set('disconnected');
  $statusMessages.set(new Map());
  console.log('[dpulse] Shutdown complete');
}

export function setError(error: string | null): void {
  $error.set(error);
}
