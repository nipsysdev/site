'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@nipsys/shadcn-lsd';
import { useTranslations } from 'next-intl';
import { Routes } from '@/constants/routes';
import { Link, usePathname } from '@/i18n/intl';
import Header from './Header';

export default function Sidenav({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Pages');
  const pathname = usePathname();

  const activePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');

  return (
    <SidebarProvider>
      <Sidebar>
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
      </Sidebar>
      <SidebarInset>
        <main className="flex flex-col gap-y-(--lsd-spacing-24) w-5xl mx-auto max-w-full p-3 sm:p-5 h-screen">
          <div className="flex items-center justify-between">
            <SidebarTrigger />
            <Header />
          </div>
          <div className="flex-auto border border-white p-(--lsd-spacing-8)">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
