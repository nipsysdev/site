import { atom } from 'nanostores';

const THEME_STORAGE_KEY = 'theme-mode';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return true;

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored === 'dark';
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark;
}

function persistTheme(isDark: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }
}

export const $isDarkMode = atom<boolean>(getInitialTheme());

let unsubscribe: (() => void) | null = null;

if (typeof window !== 'undefined') {
  if (!unsubscribe) {
    unsubscribe = $isDarkMode.subscribe((value) => {
      persistTheme(value);
    });
  }
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;
  const hasStoredTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (!hasStoredTheme && $isDarkMode.get() !== systemPrefersDark) {
    $isDarkMode.set(systemPrefersDark);
  }
}

export function toggleTheme() {
  const newValue = !$isDarkMode.get();
  $isDarkMode.set(newValue);
}

export function setTheme(isDark: boolean) {
  $isDarkMode.set(isDark);
}
