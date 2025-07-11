import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/layout/Header';
import TerminalWindow from '@/components/layout/TermWindow';
import { routing } from '@/i18n/intl';
import type { RouteData } from '@/types/routing';
import { setPageMeta } from '@/utils/metadata-utils';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = async (routeData: RouteData) =>
  await setPageMeta(routeData);

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <main className="flex flex-col gap-y-(--lsd-spacing-40) w-5xl mx-auto max-w-full p-3 sm:p-5 h-screen">
        <Header />

        <div className="w-full sm:w-4/5 mx-auto overflow-hidden flex-auto">
          <TerminalWindow>{children}</TerminalWindow>
        </div>
      </main>
    </NextIntlClientProvider>
  );
}
