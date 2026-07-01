import { atom } from 'nanostores';

export const $isAppMounted = atom<boolean>(false);
export const $isAppReady = atom<boolean>(false);
