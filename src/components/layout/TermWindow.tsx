'use client';
import { TabItem, Tabs } from '@acid-info/lsd-react/components';
import { useTranslations } from 'next-intl';
import { Routes } from '@/constants/routes';
import { Link, usePathname } from '@/i18n/intl';
import styles from '@/styles/components.module.css';

export default function TerminalWindow({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const t = useTranslations('Pages');

	const pathname = usePathname();
	const notfound = '404';
	const activeRouteName =
		Object.entries(Routes)
			.filter(([, routePath]) => routePath === pathname)
			.map(([routeName]) => routeName)
			.find(Boolean) ?? notfound;

	return (
		<div className="size-full overflow-auto">
			<Tabs
				className="mb-(--lsd-spacing-16)"
				activeTab={activeRouteName}
				fullWidth
			>
				{Object.entries(Routes).map(([routeName, routePath]) => (
					<TabItem
						key={routeName}
						name={routeName}
						className={styles.terminalTab}
					>
						<Link href={routePath}>{t(routeName)}</Link>
					</TabItem>
				))}
			</Tabs>
			{children}
		</div>
	);
}
