'use client';

import { useStore } from '@nanostores/react';
import {
  Card,
  CardContent,
  ScrollArea,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Typography,
} from '@nipsys/lsd';
import {
  BracketsCurlyIcon,
  PaletteIcon,
  UsersIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Routes } from '@/constants/routes';
import { Link, usePathname } from '@/i18n/intl';
import { $connectionStatus, $error, $peerCount } from '@/lib/dpulse/stores';
import { getConnectionMeta } from '@/lib/dpulse/utils/status';
import { $scrollY } from '@/stores/terminal-store';
import Header from './Header';

export default function Sidenav({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Pages');
  const tSidebar = useTranslations('Sidebar');
  const tDelivery = useTranslations('logosDelivery');
  const pathname = usePathname();
  const connectionStatus = useStore($connectionStatus);
  const error = useStore($error);
  const peerCount = useStore($peerCount);

  const activePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    $scrollY.set(e.currentTarget.scrollTop);
  };

  const statusMeta = getConnectionMeta(connectionStatus);
  const StatusIcon = statusMeta.icon;

  return (
    <SidebarProvider>
      <Sidebar triggerStyle={{ top: '15px' }}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(Routes).map(([routeName, routePath]) => (
                  <SidebarMenuItem key={routeName}>
                    <SidebarMenuButton
                      asChild
                      isActive={activePath === routePath}
                    >
                      <Link href={routePath}>{t(routeName)}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupLabel>{tSidebar('p2pMessaging')}</SidebarGroupLabel>
            <SidebarGroupContent className="list-none">
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <StatusIcon
                    weight="duotone"
                    className={`size-4 ${statusMeta.className}`}
                  />
                  <Typography variant="body3" className="flex-1">
                    {tDelivery(statusMeta.textKey.split('.')[1])}
                  </Typography>
                  {peerCount > 0 && (
                    <>
                      <UsersIcon
                        weight="duotone"
                        className="size-4"
                        style={{ color: 'var(--lsd-muted-foreground)' }}
                      />
                      <Typography
                        variant="body3"
                        style={{ color: 'var(--lsd-muted-foreground)' }}
                      >
                        {peerCount}
                      </Typography>
                    </>
                  )}
                  {error && (
                    <WarningIcon
                      weight="duotone"
                      className="size-4 text-yellow-500"
                      aria-label={error}
                    />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>{tSidebar('aboutSite')}</SidebarGroupLabel>
            <SidebarGroupContent className="list-none">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="https://github.com/nipsysdev/site"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BracketsCurlyIcon weight="duotone" size="0.7rem" />{' '}
                    {tSidebar('checkOutCode')}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="https://lsd.nipsys.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PaletteIcon weight="duotone" size="0.7rem" />{' '}
                    {tSidebar('andItsUI')}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="flex flex-col gap-y-(--lsd-spacing-larger) w-full mx-auto p-3 sm:p-5 h-screen overflow-hidden">
          <div className="flex items-center justify-between">
            <Header />
          </div>
          <Card className="flex-auto overflow-hidden">
            <CardContent className="h-full">
              <ScrollArea className="h-full" onScroll={handleScroll}>
                <div className="size-full">{children}</div>
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
