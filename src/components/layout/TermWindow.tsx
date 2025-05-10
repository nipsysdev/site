'use client'
import { Routes } from '@/constants/routes'
import {
  Tabcard,
  TabcardList,
  TabcardTrigger,
  TabcardContent,
} from '@srcpunks/src_ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TerminalWindow({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const notfound = '404'
  const activeRouteName =
    Object.entries(Routes)
      .filter(([, routePath]) => routePath === pathname)
      .map(([routeName]) => routeName)
      .find(Boolean) ?? notfound

  return (
    <Tabcard
      value={activeRouteName}
      className="h-full max-h-[768px] w-11/12 max-w-[1024px] overflow-hidden"
    >
      <TabcardList>
        {Object.entries(Routes).map(([routeName, routePath]) => (
          <TabcardTrigger key={routeName} value={routeName}>
            <Link href={routePath}>{routeName}</Link>
          </TabcardTrigger>
        ))}
      </TabcardList>

      {Object.keys(Routes).map((routeName) => (
        <TabcardContent key={routeName} value={routeName}>
          {routeName === activeRouteName ? children : null}
        </TabcardContent>
      ))}

      {activeRouteName === notfound && (
        <TabcardContent value={notfound}>{children}</TabcardContent>
      )}
    </Tabcard>
  )
}
