import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Header from '@/components/layout/Header'
import TerminalWindow from '@/components/layout/TermWindow'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function LayoutEn({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <NextIntlClientProvider>
        <body id="site" className={`antialiased`}>
          <main className="relative flex h-dvh w-dvw flex-col items-center">
            <Header />

            <div className="flex w-full flex-auto items-center justify-center pb-8">
              <TerminalWindow>{children}</TerminalWindow>
            </div>
          </main>
        </body>
      </NextIntlClientProvider>
    </html>
  )
}
