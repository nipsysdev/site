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
} from '@nipsys/lsd';
import { useTranslations } from 'next-intl';
import { PiBracketsCurlyDuotone, PiPaletteDuotone } from 'react-icons/pi';
import { Routes } from '@/constants/routes';
import { Link, usePathname } from '@/i18n/intl';
import { $scrollY, $terminalPromptRef } from '@/stores/terminal-store';
import Header from './Header';

export default function Sidenav({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Pages');
  const pathname = usePathname();

  const activePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
  const terminalPromptRef = useStore($terminalPromptRef);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    $scrollY.set(e.currentTarget.scrollTop);
  };

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
            <SidebarGroupLabel>About this site</SidebarGroupLabel>
            <SidebarGroupContent className="list-none">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="https://github.com/nipsysdev/site"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PiBracketsCurlyDuotone size="0.7rem" /> Check out its code
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
                    <PiPaletteDuotone size="0.7rem" /> and its UI!
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
            <CardContent
              className="h-full"
              onClick={() => terminalPromptRef?.current?.focus()}
            >
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
