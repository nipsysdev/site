import { DPULSE_CONFIG } from './constants';
import { decodeAndVerifyStatusMessage } from './protobuf/codec';
import { ServiceState } from './protobuf/schema';
import { $statusMessages } from './stores';
import type { HealthStatus } from './types';

export function mapServiceStateToStatus(state: ServiceState): HealthStatus {
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

export function updateStatusMessageAtomic(
  serviceName: string,
  status: HealthStatus,
  message: string,
  timestamp: number,
  source: 'store' | 'filter',
  hasSignature: boolean,
): void {
  const current = $statusMessages.get();
  const existing = current.get(serviceName);

  if (!existing || timestamp > existing.timestamp) {
    const updated = new Map(current);
    updated.set(serviceName, {
      service: serviceName,
      status,
      message,
      timestamp,
      metadata: {
        hasSignature,
        source,
      },
    });
    $statusMessages.set(updated);
  }
}

export async function processMessagePayload(
  payload: Uint8Array,
  source: 'store' | 'filter',
): Promise<boolean> {
  const verifiedMessage = await decodeAndVerifyStatusMessage(
    payload,
    DPULSE_CONFIG.publicKey,
  );

  if (!verifiedMessage) {
    return false;
  }

  const status = mapServiceStateToStatus(verifiedMessage.state);

  updateStatusMessageAtomic(
    verifiedMessage.serviceName,
    status,
    verifiedMessage.message || '',
    verifiedMessage.timestamp,
    source,
    !!verifiedMessage.signature,
  );

  return true;
}
