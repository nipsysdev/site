import { DPULSE_CONFIG } from './constants';
import { validateAndDecodeStatusMessage } from './protobuf/codec';
import { ServiceState } from './protobuf/schema';
import { $statusMessages } from './stores';
import type { HealthStatus } from './types';

function mapServiceState(state: number): HealthStatus {
  switch (state) {
    case ServiceState.OPERATIONAL:
      return 'healthy';
    case ServiceState.DEGRADED:
      return 'degraded';
    case ServiceState.DOWN:
      return 'down';
    default:
      throw new Error(`Invalid ServiceState: ${state}`);
  }
}

function updateStatusMessageAtomic(
  serviceName: string,
  displayName: string,
  description: string,
  status: HealthStatus,
  timestamp: number,
  iconCid: string | undefined,
  source: 'store' | 'filter',
  signature: string,
): void {
  const current = $statusMessages.get();
  const existing = current.get(serviceName);

  if (!existing || timestamp > existing.timestamp) {
    const updated = new Map(current);
    updated.set(serviceName, {
      serviceName,
      displayName,
      description,
      status,
      timestamp,
      iconCid,
      metadata: {
        source,
        signature,
      },
    });
    $statusMessages.set(updated);
  }
}

export async function processMessagePayload(
  payload: Uint8Array,
  source: 'store' | 'filter',
): Promise<boolean> {
  try {
    const message = await validateAndDecodeStatusMessage(
      payload,
      DPULSE_CONFIG.publicKey,
    );

    if (!message) {
      return false;
    }

    const status = mapServiceState(message.status);
    const iconCid = message.iconCid;

    updateStatusMessageAtomic(
      message.serviceName,
      message.displayName,
      message.description,
      status,
      message.timestamp,
      iconCid,
      source,
      message.signature ?? '',
    );

    return true;
  } catch (error) {
    console.error('Failed to process StatusMessage:', error);
    return false;
  }
}
