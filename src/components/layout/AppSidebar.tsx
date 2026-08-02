'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@nipsys/lsd';
import { useLocale, useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { LangLabels } from '@/constants/lang';
import { Routes } from '@/constants/routes';
import { Link, usePathname, useRouter } from '@/i18n/intl';

export default function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const tPages = useTranslations('Pages');
  const tHeader = useTranslations('Header');

  const activePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');

  if (!isMobile) return null;

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="shrink-0 text-[16px] font-semibold leading-none text-(--lsd-text-neutral) transition-colors hover:text-(--lsd-primary)"
        >
          <span>xav</span>
          <span style={{ color: 'var(--lsd-primary)' }}>.</span>
          <span>dev</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{tHeader('navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(Routes).map(([routeName, routePath]) => (
                <SidebarMenuItem key={routeName}>
                  <SidebarMenuButton
                    asChild
                    isActive={activePath === routePath}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={routePath}>{tPages(routeName)}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{tHeader('language')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-(--lsd-spacing-smaller) py-(--lsd-spacing-smaller) text-sm">
              {Object.keys(LangLabels).map((lang, index, arr) => {
                const isActive = lang === currentLocale;
                return (
                  <Fragment key={lang}>
                    <button
                      type="button"
                      onClick={() => {
                        if (lang !== currentLocale) {
                          router.replace(pathname, { locale: lang });
                        }
                        setOpenMobile(false);
                      }}
                      className={`inline-flex items-center justify-center px-1 transition-colors hover:text-(--lsd-text-neutral) ${
                        isActive
                          ? 'text-(--lsd-primary)'
                          : 'text-(--lsd-text-secondary)'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                    {index < arr.length - 1 && (
                      <span aria-hidden className="text-(--lsd-text-secondary)">
                        /
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
