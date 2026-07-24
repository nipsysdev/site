'use client';

import { useIsMobile } from '@nipsys/lsd';
import { useLocale, useTranslations } from 'next-intl';
import { Fragment, useEffect, useState } from 'react';
import { LangLabels } from '@/constants/lang';
import { Routes } from '@/constants/routes';
import { Link, usePathname, useRouter } from '@/i18n/intl';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const tHeader = useTranslations('Header');
  const tPages = useTranslations('Pages');
  const isMobile = useIsMobile();
  const [activeLang, setActiveLang] = useState(currentLocale);

  useEffect(() => {
    setActiveLang(currentLocale);
  }, [currentLocale]);

  const activePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');

  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] w-full items-center border-b border-(--lsd-border)">
      <div
        className={`mx-auto flex min-h-[72px] w-full max-w-[1200px] px-(--lsd-spacing-base) items-center gap-(--lsd-spacing-larger) ${
          isMobile ? 'flex-wrap' : ''
        }`}
      >
        <Link
          href="/"
          className="shrink-0 text-[16px] font-semibold leading-none text-(--lsd-text-neutral) transition-colors hover:text-(--lsd-primary)"
        >
          <span>xav</span>
          <span style={{ color: 'var(--lsd-primary)' }}>.</span>
          <span>dev</span>
        </Link>

        <nav
          aria-label="Primary"
          className={`flex items-center justify-center gap-(--lsd-spacing-smaller) ${
            isMobile ? 'order-3 w-full' : 'flex-1'
          }`}
        >
          {Object.entries(Routes).map(([routeName, routePath], index, arr) => {
            const isActive = activePath === routePath;
            const isLast = index === arr.length - 1;
            return (
              <Fragment key={routeName}>
                <Link
                  href={routePath}
                  className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-2 text-sm text-[17px]! transition-all duration-[120ms] ease sm:min-h-0 sm:px-0 ${
                    isActive
                      ? 'text-(--lsd-primary)'
                      : 'text-(--lsd-text-secondary) hover:text-(--lsd-text-neutral)'
                  }`}
                >
                  {tPages(routeName)}
                </Link>
                {!isLast && (
                  <span
                    aria-hidden
                    className="select-none px-(--lsd-spacing-smaller) text-sm text-(--lsd-text-secondary)"
                  >
                    •
                  </span>
                )}
              </Fragment>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center">
          <div
            aria-label={tHeader('languageSelector')}
            className="flex items-center gap-(--lsd-spacing-smaller) text-sm"
          >
            {Object.keys(LangLabels).map((lang, index, arr) => {
              const isActive = lang === activeLang;
              return (
                <Fragment key={lang}>
                  <button
                    type="button"
                    onClick={() => {
                      if (lang !== activeLang) {
                        router.replace(pathname, { locale: lang });
                      }
                    }}
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center px-1 transition-colors hover:text-(--lsd-text-neutral) sm:min-h-8 sm:min-w-8 ${
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
        </div>
      </div>
    </header>
  );
}
