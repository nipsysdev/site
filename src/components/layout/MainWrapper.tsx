'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { $isAppMounted } from '@/stores/app-store';
import Sidenav from './Sidenav';

export default function MainWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    $isAppMounted.set(true);
  }, []);

  return (
    <>
      <Sidenav>{children}</Sidenav>
      {/* TODO: Fix toaster export in @nipsys/lsd package to avoid doing all of this */}
      <Toaster
        className="lsd:toaster lsd:group"
        richColors
        style={
          {
            '--normal-bg': 'var(--lsd-foreground)',
            '--normal-text': 'var(--lsd-text-neutral)',
            '--normal-border': 'var(--lsd-border)',
            '--success-bg': 'var(--lsd-foreground)',
            '--success-border': 'var(--lsd-success)',
            '--success-text': 'var(--lsd-text-success)',
            '--error-bg': 'var(--lsd-foreground)',
            '--error-border': 'var(--lsd-destructive)',
            '--error-text': 'var(--lsd-text-destructive)',
            '--warning-bg': 'var(--lsd-foreground)',
            '--warning-border': 'var(--lsd-warning)',
            '--warning-text': 'var(--lsd-text-warning)',
            '--info-bg': 'var(--lsd-foreground)',
            '--info-border': 'var(--lsd-info)',
            '--info-text': 'var(--lsd-text-info)',
          } as React.CSSProperties
        }
      />
    </>
  );
}
