'use client';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { initWaku } from '@/lib/dpulse/manager';
import { $isDarkMode } from '@/stores/theme-store';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDarkMode = useStore($isDarkMode);
  const [wakuInitialized, setWakuInitialized] = useState(false);

  useEffect(() => {
    if (!wakuInitialized) {
      setWakuInitialized(true);
      initWaku();
    }
  }, [wakuInitialized]);

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
