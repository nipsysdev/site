import type { LightNode } from '@waku/sdk';
import { DPULSE_CONFIG, STORE_HISTORY_HOURS } from './constants';
import { processMessagePayload } from './message-processor';

export async function queryStoreHistory(node: LightNode): Promise<number> {
  const storeDecoder = node.createDecoder({
    contentTopic: DPULSE_CONFIG.contentTopic,
  });

  const now = new Date();
  const startTime = new Date(now.getTime() - STORE_HISTORY_HOURS * 3600000);

  console.log(
    `[dpulse] Querying Store for messages from ${startTime.toISOString()} to ${now.toISOString()}`,
  );

  const decodePromises: Promise<boolean>[] = [];

  try {
    await node.store.queryWithOrderedCallback(
      [storeDecoder],
      (wakuMessage) => {
        const payload = wakuMessage.payload;
        if (!payload || payload.length === 0) {
          return false;
        }

        if (wakuMessage.timestamp) {
          const msgTime = wakuMessage.timestamp;
          if (msgTime < startTime || msgTime > now) {
            return false;
          }
        }

        decodePromises.push(processMessagePayload(payload, 'store'));

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

    console.log(
      `[dpulse] Store query complete, processed ${messageCount} messages`,
    );

    return messageCount;
  } catch (error) {
    console.error('[dpulse] Store query failed:', error);
    return 0;
  }
}
