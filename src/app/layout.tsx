import { LsdThemeStyles } from '@acid-info/lsd-react';
import { getTranslations } from 'next-intl/server';
import { AppStateProvider } from '@/contexts/AppContext';
import 'tailwindcss/index.css';

// Initialize chunk retry manager for IPFS deployment
import '@/utils/chunk-retry';

export async function generateMetadata() {
  const tMeta = await getTranslations({ locale: 'en', namespace: 'Metadata' });

  return {
    title: tMeta('title'),
    description: tMeta('description'),
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <LsdThemeStyles />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-black h-screen w-screen monospace">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
