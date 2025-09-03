import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import MainWrapper from '@/components/layout/MainWrapper';
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
      <MainWrapper>{children}</MainWrapper>
    </NextIntlClientProvider>
  );
}
