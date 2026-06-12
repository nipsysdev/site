import {
  base64ToSignature,
  importPublicKey,
  verifyMessage,
} from '../crypto/signature';
import type { StatusMessage as StatusMessageType } from './schema';
import { ServiceState, StatusMessage } from './schema';

export function decodeStatusMessage(bytes: Uint8Array): StatusMessageType {
  const decoded = StatusMessage.decode(bytes);
  return StatusMessage.toObject(decoded, {
    longs: Number,
    enums: Number,
    bytes: Uint8Array,
  }) as unknown as StatusMessageType;
}

export function validateStatusMessage(message: StatusMessageType): boolean {
  if (!message.serviceName || typeof message.serviceName !== 'string') {
    console.error(
      'StatusMessage validation failed: missing or invalid serviceName',
    );
    return false;
  }

  if (!message.displayName || typeof message.displayName !== 'string') {
    console.error(
      'StatusMessage validation failed: missing or invalid displayName',
    );
    return false;
  }

  if (!message.description || typeof message.description !== 'string') {
    console.error(
      'StatusMessage validation failed: missing or invalid description',
    );
    return false;
  }

  if (message.status === undefined || message.status === null) {
    console.error('StatusMessage validation failed: missing status');
    return false;
  }

  const validStates = [
    ServiceState.OPERATIONAL,
    ServiceState.DEGRADED,
    ServiceState.DOWN,
  ];
  if (!validStates.includes(message.status)) {
    console.error(
      `StatusMessage validation failed: invalid status ${message.status}`,
    );
    return false;
  }

  if (!message.timestamp || typeof message.timestamp !== 'number') {
    console.error(
      'StatusMessage validation failed: missing or invalid timestamp',
    );
    return false;
  }

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (message.timestamp > now + oneHour) {
    console.error(
      `StatusMessage validation failed: timestamp ${message.timestamp} is in future (+${(message.timestamp - now) / 1000}s)`,
    );
    return false;
  }

  if (message.timestamp < now - oneHour) {
    console.error(
      `StatusMessage validation failed: timestamp ${message.timestamp} is too old (${-(message.timestamp - now) / 1000}s ago)`,
    );
    return false;
  }

  if (!message.signature || typeof message.signature !== 'string') {
    console.error('StatusMessage validation failed: missing signature');
    return false;
  }

  return true;
}

export async function validateAndDecodeStatusMessage(
  bytes: Uint8Array,
  publicKeyPem: string,
): Promise<StatusMessageType | null> {
  const message = decodeStatusMessage(bytes);

  if (!validateStatusMessage(message)) {
    return null;
  }

  try {
    const publicKey = await importPublicKey(publicKeyPem);

    const payload =
      message.serviceName +
      message.displayName +
      message.description +
      message.status.toString() +
      message.timestamp.toString();
    const payloadBytes = new TextEncoder().encode(payload);

    const signature = base64ToSignature(message.signature as string);

    const isValid = await verifyMessage(payloadBytes, signature, publicKey);

    if (!isValid) {
      console.warn(
        'StatusMessage verification failed: invalid signature for',
        message.serviceName,
      );
      return null;
    }

    return message;
  } catch (error) {
    console.error('StatusMessage verification error:', error);
    return null;
  }
}
