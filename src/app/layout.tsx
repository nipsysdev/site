import localFont from 'next/font/local';
import { getTranslations } from 'next-intl/server';
import LoadSequence from '@/components/LoadSequence';
import 'tailwindcss/index.css';
import '@nipsys/lsd/css';
import '@/app/globals.css';
import '@/utils/chunk-retry';

const ubuntuMono = localFont({
  src: [
    {
      path: '../../public/fonts/UbuntuMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/UbuntuMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-ubuntu-mono',
  display: 'swap',
  preload: true,
});

export async function generateMetadata() {
  const tMeta = await getTranslations({ locale: 'en', namespace: 'Metadata' });

  return {
    title: tMeta('title'),
    description: tMeta('description'),
    // Favicons/icons are provided via App Router file conventions:
    // src/app/favicon.ico, src/app/icon.svg, src/app/apple-icon.png
    // and src/app/manifest.ts. These auto-inject the <link>/<meta> tags.
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="paper-blue"
      suppressHydrationWarning
      className={`light ${ubuntuMono.variable}`}
    >
      <head>
        <meta name="theme-color" content="#f6f2ea" />
        <meta name="application-name" content="xav.dev" />
        <meta name="apple-mobile-web-app-title" content="xav.dev" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, interactive-widget=resizes-content"
        />
      </head>
      <body className="h-dvh w-screen monospace">
        <LoadSequence>{children}</LoadSequence>
      </body>
    </html>
  );
}
