# Pixelfed Feed Consumption - Implementation Guide

**Created:** 2026-06-10
**Status:** Ready for Implementation
**Related:** `docs/pixelfed-integration.md`, `dpulse/docs/pixelfed-feed-integration.md`

---

## Overview

The site consumes Pixelfed feed data published by dpulse via Waku. This document explains how to receive, decode, and display feed entries.

**Data Flow:**
1. dpulse fetches Atom feed → encodes as FeedBatch protobuf → publishes to Waku
2. Site subscribes via Waku Filter → receives FeedBatch → decodes → verifies signature
3. Site queries Waku Store for historical messages on startup
4. UI components reactively update via nanostores

---

## Protobuf Schema

### Types to Define

Copy the FeedBatch schema from dpulse. Define in `src/lib/dpulse/protobuf/feed-schema.ts`:

```typescript
import type { Type } from 'protobufjs';
import protobuf from 'protobufjs';

export interface FeedImage {
  url: string;
  mimeType: string;
}

export interface FeedEntry {
  id: string;
  title: string;
  link: string;
  content?: string;
  author?: string;
  published?: number;
  images: FeedImage[];
}

export interface FeedBatch {
  source: string;
  fetchedAt: number;
  entries: FeedEntry[];
  signature?: string;
}

const FeedImageType = new protobuf.Type('FeedImage')
  .add(new protobuf.Field('url', 1, 'string'))
  .add(new protobuf.Field('mimeType', 2, 'string'));

const FeedEntryType = new protobuf.Type('FeedEntry')
  .add(new protobuf.Field('id', 1, 'string'))
  .add(new protobuf.Field('title', 2, 'string'))
  .add(new protobuf.Field('link', 3, 'string'))
  .add(new protobuf.Field('content', 4, 'string', 'optional'))
  .add(new protobuf.Field('author', 5, 'string', 'optional'))
  .add(new protobuf.Field('published', 6, 'int64', 'optional'))
  .add(new protobuf.Field('images', 7, 'FeedImage', 'repeated'));

const FeedBatchType = new protobuf.Type('FeedBatch')
  .add(new protobuf.Field('source', 1, 'string'))
  .add(new protobuf.Field('fetchedAt', 2, 'int64'))
  .add(new protobuf.Field('entries', 3, 'FeedEntry', 'repeated'))
  .add(new protobuf.Field('signature', 4, 'string', 'optional'));

const root = new protobuf.Root()
  .define('dpulse')
  .add(FeedImageType)
  .add(FeedEntryType)
  .add(FeedBatchType);

export const FeedBatch = root.lookupType(
  'dpulse.FeedBatch',
) as unknown as Type;
```

**Field Numbers (from dpulse/src/protobuf/schema.ts):**
- `FeedImage`: `url=1`, `mimeType=2`
- `FeedEntry`: `id=1`, `title=2`, `link=3`, `content=4`, `author=5`, `published=6`, `images=7`
- `FeedBatch`: `source=1`, `fetchedAt=2`, `entries=3`, `signature=4`

---

## Feed Codec

Create `src/lib/dpulse/protobuf/feed-codec.ts`:

```typescript
import {
  base64ToSignature,
  importPublicKey,
  verifyMessage,
} from '../crypto/signature';
import type { FeedBatch as FeedBatchType } from './feed-schema';
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
  }

  if (!batch.signature || typeof batch.signature !== 'string') {
    console.error('FeedBatch validation failed: missing signature');
    return false;
  }

  return true;
}

function serializeEntryForSigning(entry: FeedEntry): string {
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

    // Reconstruct the payload exactly as dpulse does
    const entriesStr = batch.entries.map(serializeEntryForSigning).join('|');
    const payload = `${batch.source}:${entriesStr}:${batch.fetchedAt.toString()}`;
    const payloadBytes = new TextEncoder().encode(payload);

    const signature = base64ToSignature(batch.signature as string);

    const isValid = await verifyMessage(payloadBytes, signature, publicKey);

    if (!isValid) {
      console.error(
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
```

---

## Content Topic Configuration

Add to `src/lib/dpulse/config.ts`:

```typescript
export const DPULSE_CONFIG = {
  contentTopic: '/dpulse_site/1.0.0/prod/proto',
  feedContentTopic: '/pixelfed_feed/1.0.0/prod/proto',
  publicKey: `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAt2CsQmm+c5L0UQmpkowqQ1WqTcFHsv6kZhI508t1sXU=
-----END PUBLIC KEY-----`,
  userAgent: 'dev.nipsys.site',
} as const;
```

---

## State Management

Add to `src/lib/dpulse/stores.ts`:

```typescript
import { atom } from 'nanostores';
import type { ConnectionStatus, ServiceStatus } from './types';
import type { FeedEntry } from './protobuf/feed-schema';

export const $connectionStatus = atom<ConnectionStatus>('disconnected');
export const $statusMessages = atom<Map<string, ServiceStatus>>(new Map());
export const $isLoading = atom(false);
export const $error = atom<string | null>(null);
export const $peerCount = atom<number>(0);

// Feed stores
export const $feedEntries = atom<FeedEntry[]>([]);
export const $feedLastFetched = atom<number | null>(null);
```

---

## Waku Integration

### Option A: Extend Existing Clients

Modify `waku-filter-client.ts` to support multiple content topics:

```typescript
import type { IDecodedMessage, IDecoder, LightNode } from '@waku/sdk';
import { DPULSE_CONFIG } from './constants';
import { setError } from './manager';
import { processMessagePayload } from './message-processor';
import { processFeedBatch } from './feed-processor';

let statusDecoder: IDecoder<IDecodedMessage> | null = null;
let feedDecoder: IDecoder<IDecodedMessage> | null = null;

export function getStatusDecoder(): IDecoder<IDecodedMessage> | null {
  return statusDecoder;
}

export function getFeedDecoder(): IDecoder<IDecodedMessage> | null {
  return feedDecoder;
}

export async function setupFilterSubscription(node: LightNode): Promise<void> {
  statusDecoder = node.createDecoder({ contentTopic: DPULSE_CONFIG.contentTopic });
  feedDecoder = node.createDecoder({ contentTopic: DPULSE_CONFIG.feedContentTopic });

  console.log('[dpulse] Subscribing to status topic:', DPULSE_CONFIG.contentTopic);
  console.log('[dpulse] Subscribing to feed topic:', DPULSE_CONFIG.feedContentTopic);

  await node.filter.subscribe([statusDecoder], handleStatusMessage);
  await node.filter.subscribe([feedDecoder], handleFeedMessage);

  console.log('[dpulse] Successfully subscribed to all topics');
}

async function handleStatusMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const payload = wakuMessage.payload;
    if (!payload || payload.length === 0) return;
    await processMessagePayload(payload, 'filter');
  } catch (error) {
    console.error('[dpulse] Error handling status message:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
  }
}

async function handleFeedMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const payload = wakuMessage.payload;
    if (!payload || payload.length === 0) return;
    await processFeedBatch(payload, 'filter');
  } catch (error) {
    console.error('[dpulse] Error handling feed message:', error);
  }
}
```

### Option B: Create Feed-Specific Client

Create `src/lib/dpulse/feed-client.ts`:

```typescript
import type { IDecodedMessage, IDecoder, LightNode } from '@waku/sdk';
import { DPULSE_CONFIG, STORE_HISTORY_HOURS } from './constants';
import { validateAndDecodeFeedBatch } from './protobuf/feed-codec';
import { $feedEntries, $feedLastFetched } from './stores';

let feedDecoder: IDecoder<IDecodedMessage> | null = null;

export function getFeedDecoder(): IDecoder<IDecodedMessage> | null {
  return feedDecoder;
}

export async function setupFeedSubscription(node: LightNode): Promise<void> {
  feedDecoder = node.createDecoder({ contentTopic: DPULSE_CONFIG.feedContentTopic });

  console.log('[dpulse] Subscribing to feed topic:', DPULSE_CONFIG.feedContentTopic);
  await node.filter.subscribe([feedDecoder], handleFeedMessage);
  console.log('[dpulse] Successfully subscribed to feed messages');
}

async function handleFeedMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const payload = wakuMessage.payload;
    if (!payload || payload.length === 0) return;
    await processFeedBatch(payload, 'filter');
  } catch (error) {
    console.error('[dpulse] Error handling feed message:', error);
  }
}

export async function processFeedBatch(
  payload: Uint8Array,
  source: 'filter' | 'store',
): Promise<boolean> {
  const batch = await validateAndDecodeFeedBatch(
    payload,
    DPULSE_CONFIG.publicKey,
  );

  if (!batch) return false;

  const currentEntries = $feedEntries.get();
  const existingIds = new Set(currentEntries.map((e) => e.id));

  const newEntries = batch.entries.filter((e) => !existingIds.has(e.id));

  if (newEntries.length > 0) {
    $feedEntries.set([...newEntries, ...currentEntries].slice(0, 100));
  }

  const lastFetched = $feedLastFetched.get();
  if (!lastFetched || batch.fetchedAt > lastFetched) {
    $feedLastFetched.set(batch.fetchedAt);
  }

  console.log(
    `[dpulse] Processed FeedBatch from ${source}: ${batch.entries.length} entries, ${newEntries.length} new`,
  );
  return true;
}

export async function queryFeedHistory(node: LightNode): Promise<number> {
  const storeDecoder = node.createDecoder({
    contentTopic: DPULSE_CONFIG.feedContentTopic,
  });

  const now = new Date();
  const startTime = new Date(now.getTime() - STORE_HISTORY_HOURS * 3600000);

  console.log(
    `[dpulse] Querying Store for feed messages from ${startTime.toISOString()} to ${now.toISOString()}`,
  );

  const decodePromises: Promise<boolean>[] = [];

  try {
    await node.store.queryWithOrderedCallback(
      [storeDecoder],
      (wakuMessage) => {
        const payload = wakuMessage.payload;
        if (!payload || payload.length === 0) return false;

        if (wakuMessage.timestamp) {
          const msgTime = wakuMessage.timestamp;
          if (msgTime < startTime || msgTime > now) return false;
        }

        decodePromises.push(processFeedBatch(payload, 'store'));
        return false;
      },
      {
        paginationForward: false,
        timeStart: startTime,
        timeEnd: now,
      },
    );

    const results = await Promise.all(decodePromises);
    const messageCount = results.filter(Boolean).length;

    console.log(`[dpulse] Feed Store query complete, processed ${messageCount} batches`);
    return messageCount;
  } catch (error) {
    console.error('[dpulse] Feed Store query failed:', error);
    return 0;
  }
}
```

---

## Component Updates

### Update PixelFedGallery.tsx

Replace ISR fetch with store subscription:

```typescript
'use client';

import { Badge, Card, CardContent, Typography } from '@nipsys/lsd';
import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import { useStore } from '@nanostores/react';
import { $feedEntries, $feedLastFetched, $isLoading, $error } from '@/lib/dpulse/stores';

export default function PixelFedGallery() {
  const entries = useStore($feedEntries);
  const lastFetched = useStore($feedLastFetched);
  const isLoading = useStore($isLoading);
  const error = useStore($error);

  if (isLoading && entries.length === 0) {
    return (
      <Typography variant="body1" color="secondary">
        Loading gallery...
      </Typography>
    );
  }

  if (error && entries.length === 0) {
    return (
      <Typography variant="body1" color="destructive">
        {error}
      </Typography>
    );
  }

  if (entries.length === 0) {
    return (
      <Typography variant="body1" color="secondary">
        No posts found.
      </Typography>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--lsd-spacing-base)">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-0">
            {entry.images.length > 0 && (
              <Image
                src={entry.images[0].url}
                alt={entry.title}
                width={400}
                height={400}
                unoptimized
                className="object-cover aspect-square w-full"
              />
            )}
            <div className="flex flex-col gap-(--lsd-spacing-smaller) p-(--lsd-spacing-base)">
              <Typography variant="body2" className="line-clamp-2">
                {entry.title || entry.content || 'Untitled'}
              </Typography>
              <div className="flex items-center justify-between">
                <Badge variant="outlined" size="sm">
                  {entry.published
                    ? new Date(entry.published).toLocaleDateString()
                    : 'Unknown date'}
                </Badge>
                <a
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--lsd-text-secondary) hover:text-(--lsd-text-primary) transition-colors"
                >
                  <ArrowSquareOutIcon weight="duotone" size={18} />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Implementation Checklist

- [ ] Create `src/lib/dpulse/protobuf/feed-schema.ts`
- [ ] Create `src/lib/dpulse/protobuf/feed-codec.ts`
- [ ] Add `feedContentTopic` to `config.ts`
- [ ] Add feed stores to `stores.ts`
- [ ] Create `feed-client.ts` or extend existing Waku clients
- [ ] Initialize feed subscription in `manager.ts`
- [ ] Update `PixelFedGallery.tsx` to use stores
- [ ] Remove or keep old ISR fetch from `src/lib/pixelfed.ts` as fallback

---

## Notes

- **Signature verification**: Uses the same Ed25519 public key as status messages (defined in `DPULSE_CONFIG.publicKey`)
- **Batch limits**: Feed batches are limited to 20 entries, published every 30 minutes
- **Deduplication**: Handle duplicate entries (same `id`) by filtering in `processFeedBatch`
- **Store limit**: Consider capping stored entries (e.g., 100) to prevent memory issues
- **Timestamp display**: Use `$feedLastFetched` to show "last updated" in UI
- **Fallback**: Keep existing ISR fetch in `src/lib/pixelfed.ts` as a fallback if Waku is unavailable
