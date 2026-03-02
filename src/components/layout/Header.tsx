'use client';
import { useStore } from '@nanostores/react';
import { Button, ButtonGroup } from '@nipsys/shadcn-lsd';
import { PiGithubLogoFill, PiMoonFill, PiSunFill } from 'react-icons/pi';
import { LangLabels } from '@/constants/lang';
import { Link, usePathname } from '@/i18n/intl';
import { $isDarkMode, toggleTheme } from '@/stores/theme-store';

export default function Header() {
  const pathname = usePathname();
  const isDarkMode = useStore($isDarkMode);

  return (
    <div className="flex w-full items-center justify-end tracking-tighter transition-colors text-(length:--lsd-body1-fontSize) gap-x-(--lsd-spacing-24)">
      <ButtonGroup>
        {Object.entries(LangLabels).map(([lang, label]) => (
          <Button key={lang} variant="outlined" size="sm">
            <Link href={pathname} locale={lang}>
              {label.slice(0, 2)}
            </Link>
          </Button>
        ))}
      </ButtonGroup>

      <Button
        variant="outlined"
        size="sm"
        onClick={toggleTheme}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <PiSunFill size="1rem" /> : <PiMoonFill size="1rem" />}
      </Button>

      <Button variant="outlined" size="sm">
        <a
          href="https://github.com/nipsysdev/site"
          rel="noopener"
          target="_blank"
        >
          <PiGithubLogoFill size="1rem" />
        </a>
      </Button>
    </div>
  );
}
