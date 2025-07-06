'use client';
import { TabItem, Tabs } from '@acid-info/lsd-react/components';
import { useTranslations } from 'next-intl';
import { Routes } from '@/constants/routes';
import { Link, usePathname } from '@/i18n/intl';

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
		<div>
			<Tabs activeTab={activeRouteName} fullWidth>
				{Object.entries(Routes).map(([routeName, routePath]) => (
					<TabItem key={routeName} name={routeName}>
						<Link href={routePath}>{t(routeName)}</Link>
					</TabItem>
				))}
			</Tabs>
			{children}
		</div>
		// <Tabcard
		//   value={activeRouteName}
		//   className="h-full max-h-[768px] w-11/12 max-w-[1024px] overflow-hidden"
		// >
		//   <TabcardList>
		//     {Object.entries(Routes).map(([routeName, routePath]) => (
		//       <TabcardTrigger key={routeName} value={routeName} asChild>
		//         <Link href={routePath}>{t(routeName)}</Link>
		//       </TabcardTrigger>
		//     ))}
		//   </TabcardList>

		//   {Object.keys(Routes).map((routeName) => (
		//     <TabcardContent key={routeName} value={routeName}>
		//       {routeName === activeRouteName ? children : null}
		//     </TabcardContent>
		//   ))}

		//   {activeRouteName === notfound && (
		//     <TabcardContent value={notfound}>{children}</TabcardContent>
		//   )}
		// </Tabcard>
	);
}
