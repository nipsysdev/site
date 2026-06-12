import type { IDecodedMessage, IDecoder, LightNode } from '@waku/sdk';
import { DPULSE_CONFIG } from './constants';
import { processFeedBatch } from './feed-processor';
import { setError } from './manager';
import { processMessagePayload } from './message-processor';

let decoder: IDecoder<IDecodedMessage> | null = null;
let feedDecoder: IDecoder<IDecodedMessage> | null = null;

export function getDecoder(): IDecoder<IDecodedMessage> | null {
  return decoder;
}

export function getFeedDecoder(): IDecoder<IDecodedMessage> | null {
  return feedDecoder;
}

export async function setupFilterSubscription(node: LightNode): Promise<void> {
  decoder = node.createDecoder({ contentTopic: DPULSE_CONFIG.contentTopic });
  feedDecoder = node.createDecoder({
    contentTopic: DPULSE_CONFIG.feedContentTopic,
  });

  console.log(
    `[dpulse] Subscribing to content topic:`,
    DPULSE_CONFIG.contentTopic,
  );

  console.log(
    `[dpulse] Subscribing to feed content topic:`,
    DPULSE_CONFIG.feedContentTopic,
  );

  await node.filter.subscribe([decoder], handleMessage);
  await node.filter.subscribe([feedDecoder], handleFeedMessage);

  console.log('[dpulse] Successfully subscribed to dpulse messages');
}

async function handleMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const payload = wakuMessage.payload;
    if (!payload || payload.length === 0) {
      return;
    }

    await processMessagePayload(payload, 'filter');
  } catch (error) {
    console.error('[dpulse] Error handling message:', error);
    setError(
      error instanceof Error ? error.message : 'Unknown error handling message',
    );
  }
}

async function handleFeedMessage(wakuMessage: IDecodedMessage): Promise<void> {
  try {
    const payload = wakuMessage.payload;
    if (!payload || payload.length === 0) {
      return;
    }

    await processFeedBatch(payload, 'filter');
  } catch (error) {
    console.error('[dpulse] Error handling feed message:', error);
    setError(
      error instanceof Error
        ? error.message
        : 'Unknown error handling feed message',
    );
  }
}
