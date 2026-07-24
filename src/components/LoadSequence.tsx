'use client';

import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $isAppMounted, $isAppReady } from '@/stores/app-store';

export default function LoadSequence({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [fontsReady, setFontsReady] = useState(false);
  const isAppMounted = useStore($isAppMounted);

  const isLoading = !isAppMounted || !fontsReady;

  useEffect(() => {
    let cancelled = false;
    const fontsPromise =
      typeof document !== 'undefined'
        ? document.fonts.ready
        : Promise.resolve();
    fontsPromise.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      $isAppReady.set(true);
    }
  }, [isLoading]);

  return <>{children}</>;
}
