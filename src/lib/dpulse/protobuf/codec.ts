import {
  base64ToSignature,
  importPublicKey,
  verifyMessage,
} from '../crypto/signature';
import type { StatusMessage as StatusMessageType } from './schema';
import { StatusMessage } from './schema';

export function decodeStatusMessage(bytes: Uint8Array): StatusMessageType {
  const decoded = StatusMessage.decode(bytes);
  return StatusMessage.toObject(decoded, {
    longs: Number,
    enums: Number,
    bytes: Uint8Array,
  }) as unknown as StatusMessageType;
}

export async function decodeAndVerifyStatusMessage(
  bytes: Uint8Array,
  publicKeyPem: string,
): Promise<StatusMessageType | null> {
  const message = decodeStatusMessage(bytes);

  if (!message.signature || !message.publicKey) {
    return null;
  }

  const publicKey = await importPublicKey(publicKeyPem);

  const encoder = new TextEncoder();
  const payload =
    message.serviceName +
    message.state.toString() +
    message.timestamp.toString();
  const payloadBytes = encoder.encode(payload);

  const signature = base64ToSignature(message.signature);

  const isValid = await verifyMessage(payloadBytes, signature, publicKey);

  return isValid ? message : null;
}
