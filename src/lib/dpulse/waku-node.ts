import type { CreateNodeOptions, LightNode } from '@waku/sdk';
import {
  createLightNode,
  Protocols,
  WakuEvent,
  HealthStatus as WakuHealthStatus,
} from '@waku/sdk';
import {
  DPULSE_CONFIG,
  PEER_RETRY_BASE_DELAY_MS,
  PEER_RETRY_MAX_DELAY_MS,
  PEER_WAIT_TIMEOUT_MS,
} from './constants';
import { scheduleRetry } from './retry-manager';
import { $connectionStatus, $peerCount } from './stores';
import { getDecoder, setupFilterSubscription } from './waku-filter-client';
import { queryStoreHistory } from './waku-store-client';

let wakuNode: LightNode | null = null;
let healthListener: ((event: CustomEvent) => void) | null = null;
let peerCountInterval: ReturnType<typeof setInterval> | null = null;

async function updatePeerCount(): Promise<void> {
  if (!wakuNode) return;
  try {
    const peers = await wakuNode.getConnectedPeers();
    $peerCount.set(peers.length);
  } catch (error) {
    console.warn('[dpulse] Failed to get peer count:', error);
  }
}

function startPeerCountUpdates(): void {
  updatePeerCount();
  if (peerCountInterval) clearInterval(peerCountInterval);
  peerCountInterval = setInterval(updatePeerCount, 30000);
}

function stopPeerCountUpdates(): void {
  if (peerCountInterval) {
    clearInterval(peerCountInterval);
    peerCountInterval = null;
  }
}

async function waitForPeersWithRetry(node: LightNode): Promise<void> {
  let attempt = 0;

  while (true) {
    attempt++;
    try {
      console.log(
        `[dpulse] Waiting for Store and Filter peers (attempt ${attempt})...`,
      );
      await node.waitForPeers(
        [Protocols.Store, Protocols.Filter],
        PEER_WAIT_TIMEOUT_MS,
      );
      console.log('[dpulse] Store and Filter peers connected');
      return;
    } catch (error) {
      const delay = Math.min(
        PEER_RETRY_BASE_DELAY_MS * 2 ** Math.min(attempt - 1, 5),
        PEER_RETRY_MAX_DELAY_MS,
      );
      console.warn(
        `[dpulse] Peer wait failed (attempt ${attempt}), retrying in ${delay}ms...`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function cleanup(): Promise<void> {
  stopPeerCountUpdates();

  if (wakuNode && healthListener) {
    wakuNode.events.removeEventListener(WakuEvent.Health, healthListener);
    healthListener = null;
  }

  const decoder = getDecoder();
  if (wakuNode && decoder) {
    try {
      await wakuNode.filter.unsubscribe([decoder]);
      console.log('[dpulse] Unsubscribed from Filter');
    } catch (error) {
      console.warn('[dpulse] Failed to unsubscribe from Filter:', error);
    }
  }

  if (wakuNode) {
    try {
      await wakuNode.stop();
      console.log('[dpulse] Node stopped');
    } catch (error) {
      console.warn('[dpulse] Failed to stop node:', error);
    }
    wakuNode = null;
  }
}

export async function createAndStartNode(): Promise<LightNode> {
  const options: CreateNodeOptions = {
    defaultBootstrap: true,
    autoStart: true,
    userAgent: DPULSE_CONFIG.userAgent,
  };

  const node = await createLightNode(options);
  console.log('[dpulse] Waku node created');

  await waitForPeersWithRetry(node);

  console.log(
    '[dpulse] Starting Store query and Filter subscription in parallel...',
  );

  await Promise.all([queryStoreHistory(node), setupFilterSubscription(node)]);

  console.log('[dpulse] Store query and Filter subscription complete');
  wakuNode = node;
  $connectionStatus.set('connected');
  startPeerCountUpdates();

  healthListener = (event: CustomEvent) => {
    const health = event.detail;
    console.log('[dpulse] Waku health status:', health);

    if (health === WakuHealthStatus.Unhealthy) {
      console.log('[dpulse] Node became unhealthy, scheduling retry...');
      $connectionStatus.set('connecting');
      scheduleRetry();
    }
  };
  node.events.addEventListener(WakuEvent.Health, healthListener);

  return node;
}

export function setWakuNode(node: LightNode | null): void {
  wakuNode = node;
}
