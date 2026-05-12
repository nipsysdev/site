import type { IDecodedMessage, IDecoder, LightNode } from '@waku/sdk';
import { DPULSE_CONFIG } from './constants';
import { setError } from './manager';
import { processMessagePayload } from './message-processor';

let decoder: IDecoder<IDecodedMessage> | null = null;

export function getDecoder(): IDecoder<IDecodedMessage> | null {
  return decoder;
}

export async function setupFilterSubscription(node: LightNode): Promise<void> {
  decoder = node.createDecoder({ contentTopic: DPULSE_CONFIG.contentTopic });

  console.log(
    `[dpulse] Subscribing to content topic:`,
    DPULSE_CONFIG.contentTopic,
  );

  await node.filter.subscribe([decoder], handleMessage);

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
