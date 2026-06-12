'use client';
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { $isDarkMode } from '@/stores/theme-store';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDarkMode = useStore($isDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
