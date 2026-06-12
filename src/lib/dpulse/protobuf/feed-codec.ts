import {
  base64ToSignature,
  importPublicKey,
  verifyMessage,
} from '../crypto/signature';
import type { FeedBatch as FeedBatchType, FeedEntry } from './feed-schema';
import { FeedBatch } from './feed-schema';

export function decodeFeedBatch(bytes: Uint8Array): FeedBatchType {
  const decoded = FeedBatch.decode(bytes);
  return FeedBatch.toObject(decoded, {
    longs: Number,
    enums: Number,
    bytes: Uint8Array,
  }) as unknown as FeedBatchType;
}

export function validateFeedBatch(batch: FeedBatchType): boolean {
  if (!batch.source || typeof batch.source !== 'string') {
    console.error('FeedBatch validation failed: missing or invalid source');
    return false;
  }

  if (!batch.fetchedAt || typeof batch.fetchedAt !== 'number') {
    console.error('FeedBatch validation failed: missing or invalid fetchedAt');
    return false;
  }

  if (!Array.isArray(batch.entries)) {
    console.error('FeedBatch validation failed: missing or invalid entries');
    return false;
  }

  for (const entry of batch.entries) {
    if (!entry.id || typeof entry.id !== 'string') {
      console.error('FeedBatch validation failed: entry missing id');
      return false;
    }
    if (!entry.title || typeof entry.title !== 'string') {
      console.error('FeedBatch validation failed: entry missing title');
      return false;
    }
    if (!entry.link || typeof entry.link !== 'string') {
      console.error('FeedBatch validation failed: entry missing link');
      return false;
    }
    if (!entry.images || !Array.isArray(entry.images)) {
      console.error('FeedBatch validation failed: entry missing images');
      return false;
    }
  }

  if (!batch.signature || typeof batch.signature !== 'string') {
    console.error('FeedBatch validation failed: missing signature');
    return false;
  }

  return true;
}

export function serializeEntryForSigning(entry: FeedEntry): string {
  const imagesStr = entry.images
    .map((img) => `${img.url}:${img.mimeType}`)
    .join(',');
  return `${entry.id}:${entry.title}:${entry.link}:${entry.content || ''}:${entry.author || ''}:${entry.published?.toString() || ''}:${imagesStr}`;
}

export async function validateAndDecodeFeedBatch(
  bytes: Uint8Array,
  publicKeyPem: string,
): Promise<FeedBatchType | null> {
  const batch = decodeFeedBatch(bytes);

  if (!validateFeedBatch(batch)) {
    return null;
  }

  try {
    const publicKey = await importPublicKey(publicKeyPem);

    const entriesStr = batch.entries.map(serializeEntryForSigning).join('|');
    const payload = `${batch.source}:${entriesStr}:${batch.fetchedAt.toString()}`;
    const payloadBytes = new TextEncoder().encode(payload);

    const signature = base64ToSignature(batch.signature as string);

    const isValid = await verifyMessage(payloadBytes, signature, publicKey);

    if (!isValid) {
      console.warn(
        'FeedBatch verification failed: invalid signature for',
        batch.source,
      );
      return null;
    }

    return batch;
  } catch (error) {
    console.error('FeedBatch verification error:', error);
    return null;
  }
}
