'use client';

import { useStore } from '@nanostores/react';
import { SidebarTrigger, useSidebar } from '@nipsys/lsd';
import { useLocale, useTranslations } from 'next-intl';
import { Fragment, useEffect, useRef, useState } from 'react';
import TerminalPrompt, {
  type TerminalPromptRef,
} from '@/components/terminal/TerminalPrompt';
import { LangLabels } from '@/constants/lang';
import { Routes } from '@/constants/routes';
import { Link, usePathname, useRouter } from '@/i18n/intl';
import { $isAppReady } from '@/stores/app-store';
import { $terminalPromptRef } from '@/stores/terminal-store';

/** Shared class fragments — extracted to keep the mobile/desktop branches DRY. */
const HEADER_BASE = 'sticky top-0 z-20 flex w-full items-center';
const INNER_BASE = 'mx-auto w-full max-w-[1200px] px-(--lsd-spacing-base)';
const BOTTOM_BORDER = 'border-b border-(--lsd-border)';
const ACTIVE_TEXT = 'text-(--lsd-primary)';
const INACTIVE_TEXT = 'text-(--lsd-text-secondary)';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const tHeader = useTranslations('Header');
  const tPages = useTranslations('Pages');
  const tTerminal = useTranslations('Terminal');
  const { isMobile } = useSidebar();
  const isAppReady = useStore($isAppReady);
  const [activeLang, setActiveLang] = useState(currentLocale);
  const [hasWindow, setHasWindow] = useState(false);
  const headerPrompt = useRef<TerminalPromptRef>(null);

  useEffect(() => {
    setActiveLang(currentLocale);
  }, [currentLocale]);

  useEffect(() => setHasWindow(typeof window !== 'undefined'), []);

  useEffect(() => {
    if (hasWindow && isAppReady) {
      setTimeout(() => {
        $terminalPromptRef.set(headerPrompt);
        headerPrompt.current?.focus();
      }, 100);
    }
  }, [hasWindow, isAppReady]);

  const activePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');

  const wordmark = (
    <Link
      href="/"
      className="shrink-0 text-[16px] font-semibold leading-none text-(--lsd-text-neutral) transition-colors hover:text-(--lsd-primary)"
    >
      <span>xav</span>
      <span style={{ color: 'var(--lsd-primary)' }}>.</span>
      <span>dev</span>
    </Link>
  );

  if (isMobile) {
    return (
      <header className={`${HEADER_BASE} ${BOTTOM_BORDER}`}>
        <div
          className={`${INNER_BASE} flex items-center gap-(--lsd-spacing-base) py-(--lsd-spacing-small)`}
        >
          <SidebarTrigger text={tHeader('menuTrigger')} />
          <div className="min-w-0 flex-1">
            <TerminalPrompt ref={headerPrompt} i18n={tTerminal} />
          </div>
          {wordmark}
        </div>
      </header>
    );
  }

  return (
    <>
      <header className={`${HEADER_BASE} min-h-[72px]`}>
        <div
          className={`${INNER_BASE} flex items-center gap-(--lsd-spacing-larger)`}
        >
          {wordmark}

          <nav
            aria-label="Primary"
            className="flex flex-1 items-center justify-center gap-(--lsd-spacing-smaller)"
          >
            {Object.entries(Routes).map(
              ([routeName, routePath], index, arr) => {
                const isActive = activePath === routePath;
                const isLast = index === arr.length - 1;
                return (
                  <Fragment key={routeName}>
                    <Link
                      href={routePath}
                      className={`inline-flex shrink-0 items-center whitespace-nowrap text-[17px] leading-5 transition-all duration-[120ms] ease ${
                        isActive
                          ? ACTIVE_TEXT
                          : `${INACTIVE_TEXT} hover:text-(--lsd-text-neutral)`
                      }`}
                    >
                      {tPages(routeName)}
                    </Link>
                    {!isLast && (
                      <span
                        aria-hidden
                        className={`select-none px-(--lsd-spacing-smaller) text-sm ${INACTIVE_TEXT}`}
                      >
                        •
                      </span>
                    )}
                  </Fragment>
                );
              },
            )}
          </nav>

          <div className="ml-auto flex shrink-0 items-center">
            <fieldset
              aria-label={tHeader('languageSelector')}
              className="m-0 flex items-center gap-(--lsd-spacing-smaller) border-0 p-0 text-sm"
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
                      className={`inline-flex min-h-8 min-w-8 items-center justify-center px-1 transition-colors hover:text-(--lsd-text-neutral) ${
                        isActive ? ACTIVE_TEXT : INACTIVE_TEXT
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                    {index < arr.length - 1 && (
                      <span aria-hidden className={INACTIVE_TEXT}>
                        /
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </fieldset>
          </div>
        </div>
      </header>
      <div className={`w-full ${BOTTOM_BORDER}`}>
        <div className={`${INNER_BASE} pb-(--lsd-spacing-small)`}>
          <TerminalPrompt ref={headerPrompt} i18n={tTerminal} />
        </div>
      </div>
    </>
  );
}
