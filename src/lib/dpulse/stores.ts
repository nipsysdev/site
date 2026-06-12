import { atom, onMount } from 'nanostores';
import { initWaku } from './manager';
import type { FeedEntry } from './protobuf/feed-schema';
import type { ConnectionStatus, ServiceStatus } from './types';

export const $connectionStatus = atom<ConnectionStatus>('disconnected');
export const $statusMessages = atom<Map<string, ServiceStatus>>(new Map());
export const $isLoading = atom(false);
export const $error = atom<string | null>(null);
export const $peerCount = atom<number>(0);

// Feed stores
export const $feedEntries = atom<FeedEntry[]>([]);
export const $feedLastFetched = atom<number | null>(null);

onMount($connectionStatus, () => {
  initWaku();
});
