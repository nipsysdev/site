import { getTranslations } from 'next-intl/server';
import LoadSequence from '@/components/LoadSequence';
import ThemeProvider from '@/components/ThemeProvider';
import 'tailwindcss/index.css';
import '@nipsys/lsd/css';
import '@/app/globals.css';
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
    <html lang="en" data-theme="nord" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, interactive-widget=resizes-content"
        />
      </head>
      <body className="h-dvh w-screen monospace">
        <ThemeProvider>
          <LoadSequence>{children}</LoadSequence>
        </ThemeProvider>
      </body>
    </html>
  );
}
