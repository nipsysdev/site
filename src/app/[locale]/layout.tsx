import { LsdThemeStyles } from '@acid-info/lsd-react';
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
		<html lang={locale} data-theme="dark">
			<head>
				<LsdThemeStyles />
			</head>
			<NextIntlClientProvider>
				<body id="site" className="antialiased">
					<main className="monospace relative flex h-dvh w-dvw flex-col items-center">
						<Header />

						<div className="flex w-full flex-auto items-center justify-center pb-8">
							<TerminalWindow>{children}</TerminalWindow>
						</div>
					</main>
				</body>
			</NextIntlClientProvider>
		</html>
	);
}
