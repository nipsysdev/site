import type {
  CreateNodeOptions,
  IDecodedMessage,
  IDecoder,
  LightNode,
} from '@waku/sdk';
import {
  createLightNode,
  Protocols,
  WakuEvent,
  HealthStatus as WakuHealthStatus,
} from '@waku/sdk';
import { atom } from 'nanostores';
import { DPULSE_CONFIG } from '../lib/dpulse/config';
import { decodeAndVerifyStatusMessage } from '../lib/dpulse/protobuf/codec';
import { ServiceState } from '../lib/dpulse/protobuf/schema';
import type {
  ConnectionStatus,
  HealthStatus,
} from '../lib/dpulse/utils/status';

export interface ServiceStatus {
  service: string;
  status: HealthStatus;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ServiceConfig {
  name: string;
  publicKey: string;
}

export const $connectionStatus = atom<ConnectionStatus>('disconnected');
export const $statusMessages = atom<Map<string, ServiceStatus>>(new Map());
export const $services = atom<ServiceConfig[]>([
  {
    name: 'dpulse',
    publicKey: DPULSE_CONFIG.publicKey,
  },
]);
export const $isLoading = atom(false);
export const $error = atom<string | null>(null);

let wakuNode: LightNode | null = null;
let decoder: IDecoder<IDecodedMessage> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;

function mapServiceStateToStatus(state: ServiceState): HealthStatus {
  switch (state) {
    case ServiceState.OPERATIONAL:
      return 'healthy';
    case ServiceState.DEGRADED:
      return 'degraded';
    case ServiceState.DOWN:
      return 'down';
    default:
      return 'unknown';
  }
}

async function createAndStartNode(): Promise<LightNode> {
  const options: CreateNodeOptions = {
    defaultBootstrap: true,
    autoStart: true,
    userAgent: DPULSE_CONFIG.userAgent,
  };

  const node = await createLightNode(options);
  console.log('Waku node created');

  node.events.addEventListener(WakuEvent.Health, (event: CustomEvent) => {
    const health = event.detail;
    console.log('Waku health status:', health);

    if (health === WakuHealthStatus.SufficientlyHealthy) {
      console.log('Node is sufficiently healthy, setting up subscription...');
      setupSubscription(node).catch((err) => {
        console.error('Failed to setup subscription:', err);
        setError(err.message);
        scheduleRetry();
      });
    } else if (health === WakuHealthStatus.Unhealthy) {
      console.log('Node became unhealthy, scheduling retry...');
      $connectionStatus.set('connecting');
      scheduleRetry();
    }
  });

  const initialHealth = node.health;
  if (initialHealth === WakuHealthStatus.SufficientlyHealthy) {
    console.log('Node already healthy, setting up subscription...');
    try {
      await setupSubscription(node);
    } catch (err) {
      console.error(
        'Failed to setup subscription on initial health check:',
        err,
      );
      setError(
        err instanceof Error ? err.message : 'Failed to setup subscription',
      );
      scheduleRetry();
    }
  }

  return node;
}

async function setupSubscription(node: LightNode): Promise<void> {
  try {
    console.log('Waiting for Filter peers...');
    await node.waitForPeers([Protocols.Filter]);
    console.log('Filter peers available');

    decoder = node.createDecoder({ contentTopic: DPULSE_CONFIG.contentTopic });

    console.log('Subscribing to content topic:', DPULSE_CONFIG.contentTopic);
    await node.filter.subscribe([decoder], handleMessage);
    console.log('Successfully subscribed to dpulse messages');

    setConnectionStatus('connected');
  } catch (error) {
    console.error('Failed to setup subscription:', error);
    throw error;
  }
}

async function handleMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const payload = wakuMessage.payload;
    if (!payload || payload.length === 0) {
      return;
    }

    const verifiedMessage = await decodeAndVerifyStatusMessage(
      payload,
      DPULSE_CONFIG.publicKey,
    );

    if (!verifiedMessage) {
      console.warn('Failed to verify status message signature');
      return;
    }

    const status = mapServiceStateToStatus(verifiedMessage.state);

    updateStatusMessage({
      service: verifiedMessage.serviceName,
      status,
      message: verifiedMessage.message || '',
      timestamp: verifiedMessage.timestamp,
      metadata: {
        hasSignature: !!verifiedMessage.signature,
      },
    });
  } catch (error) {
    console.error('Error handling dpulse message:', error);
    setError(
      error instanceof Error ? error.message : 'Unknown error handling message',
    );
  }
}

function clearRetryTimer(): void {
  retryCount = 0;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

function scheduleRetry(): void {
  retryCount++;
  console.log(
    `Scheduling Waku connection retry #${retryCount} in 5 seconds...`,
  );
  $connectionStatus.set('connecting');

  retryTimer = setTimeout(async () => {
    try {
      await attemptConnection();
    } catch (error) {
      console.error(`Retry #${retryCount} failed:`, error);
      scheduleRetry();
    }
  }, 5000);
}

async function attemptConnection(): Promise<void> {
  $connectionStatus.set('connecting');
  $error.set(null);
  console.log(`Attempting Waku connection (retry #${retryCount})...`);

  const node = await createAndStartNode();
  wakuNode = node;
}

export async function initWaku(): Promise<void> {
  clearRetryTimer();

  if (wakuNode) {
    console.log('Dpulse subscription already active');
    return;
  }

  try {
    $connectionStatus.set('connecting');
    $error.set(null);
    console.log('Creating Waku node...');

    const node = await createAndStartNode();
    wakuNode = node;
  } catch (error) {
    console.error('Failed to start dpulse subscription:', error);
    const errorMsg =
      error instanceof Error ? error.message : 'Failed to start subscription';
    setError(errorMsg);
    scheduleRetry();
  }
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

export const connectionStatusStore = $connectionStatus;
export const statusMessagesStore = $statusMessages;
export const isLoadingStore = $isLoading;
export const errorStore = $error;
export const servicesStore = $services;
