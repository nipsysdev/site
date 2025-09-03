'use client';

import { PortalProvider } from '@nipsysdev/lsd-react/client/PortalProvider';
import Header from './Header';
import Sidenav from './Sidenav';

export default function MainWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PortalProvider>
      <main className="flex flex-col gap-y-(--lsd-spacing-24) w-5xl mx-auto max-w-full p-3 sm:p-5 h-screen">
        <Header />

        <div className="w-full flex mx-auto overflow-hidden flex-auto">
          <Sidenav />
          <div className="flex-auto border border-white p-(--lsd-spacing-8)">
            {children}
          </div>
        </div>
      </main>
    </PortalProvider>
  );
}
