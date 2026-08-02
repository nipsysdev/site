'use client';

import { useStore } from '@nanostores/react';
import { SidebarProvider } from '@nipsys/lsd';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { $isAppMounted, $isAppReady } from '@/stores/app-store';
import AppSidebar from './AppSidebar';
import AuroraBackground from './AuroraBackground';
import Footer from './Footer';
import TopNav from './TopNav';

export default function MainWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAppReady = useStore($isAppReady);

  useEffect(() => {
    $isAppMounted.set(true);
  }, []);

  return (
    <>
      <AuroraBackground />
      <SidebarProvider style={{ display: 'contents' }}>
        <div
          className={`relative z-10 flex h-dvh w-screen flex-col transition-opacity duration-700 ${isAppReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <TopNav />
          <main className="flex w-full min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
          <Footer />
        </div>
        <AppSidebar />
      </SidebarProvider>
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
