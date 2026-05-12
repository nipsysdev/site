import { clearRetryTimer, scheduleRetry } from './retry-manager';
import {
  $connectionStatus,
  $error,
  $isLoading,
  $statusMessages,
} from './stores';
import type { ConnectionStatus, ServiceStatus } from './types';
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

export function setConnectionStatus(status: ConnectionStatus): void {
  $connectionStatus.set(status);
}

export function updateStatusMessage(message: ServiceStatus): void {
  const currentMessages = $statusMessages.get();
  const newMessages = new Map(currentMessages);
  newMessages.set(message.service, message);
  $statusMessages.set(newMessages);
}

export function setError(error: string | null): void {
  $error.set(error);
}
