import { getTranslations } from 'next-intl/server';
import LoadSequence from '@/components/LoadSequence';
import 'tailwindcss/index.css';
import '@nipsys/shadcn-lsd/css';
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-dvh w-screen monospace">
        <LoadSequence>{children}</LoadSequence>
      </body>
    </html>
  );
}
