import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/intl'
import { setRequestLocale } from 'next-intl/server'
import { MetadataUtils } from '@/utils/metadata-utils'
import { RouteData } from '@/types/routing'
import Header from '@/components/layout/Header'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async (routeData: RouteData) =>
  await MetadataUtils.setPageMeta(routeData)

export default async function Layout({
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
            <div className="flex h-full w-11/12 flex-col items-center justify-evenly">
              <div className="w-3/5">
                <Header />
              </div>

              {children}
            </div>
          </main>
        </body>
      </NextIntlClientProvider>
    </html>
  )
}
