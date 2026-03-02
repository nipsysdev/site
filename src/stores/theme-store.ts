import { atom } from 'nanostores';

export const $isDarkMode = atom<boolean>(true);

export function toggleTheme() {
  $isDarkMode.set(!$isDarkMode.get());
}

export function setTheme(isDark: boolean) {
  $isDarkMode.set(isDark);
}
