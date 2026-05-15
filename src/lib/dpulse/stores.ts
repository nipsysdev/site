import { atom } from 'nanostores';
import type { ConnectionStatus, ServiceStatus } from './types';

export const $connectionStatus = atom<ConnectionStatus>('disconnected');
export const $statusMessages = atom<Map<string, ServiceStatus>>(new Map());
export const $isLoading = atom(false);
export const $error = atom<string | null>(null);
export const $peerCount = atom<number>(0);
