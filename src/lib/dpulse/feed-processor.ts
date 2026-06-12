import { DPULSE_CONFIG } from './config';
import { validateAndDecodeFeedBatch } from './protobuf/feed-codec';
import { $feedEntries, $feedLastFetched } from './stores';

export async function processFeedBatch(
  payload: Uint8Array,
  source: 'filter' | 'store',
): Promise<boolean> {
  const batch = await validateAndDecodeFeedBatch(
    payload,
    DPULSE_CONFIG.publicKey,
  );

  if (!batch) {
    console.warn(`[dpulse] ${source}: Invalid feed batch, skipping`);
    return false;
  }

  // Only update if this batch is newer than the last one we processed
  const lastFetched = $feedLastFetched.get();
  if (lastFetched !== null && batch.fetchedAt <= lastFetched) {
    console.log(
      `[dpulse] ${source}: Skipping older batch (fetchedAt: ${batch.fetchedAt}, lastFetched: ${lastFetched})`,
    );
    return false;
  }

  $feedEntries.set(batch.entries);
  $feedLastFetched.set(batch.fetchedAt);

  console.log(
    `[dpulse] ${source}: Updated feed with ${batch.entries.length} entries (fetchedAt: ${batch.fetchedAt})`,
  );

  return true;
}
