'use client';
import { useStore } from '@nanostores/react';
import {
  Button,
  SidebarTrigger,
  ToggleGroup,
  ToggleGroupItem,
  useIsMobile,
} from '@nipsys/lsd';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { PiMoonFill, PiSunFill } from 'react-icons/pi';
import { LangLabels } from '@/constants/lang';
import { usePathname, useRouter } from '@/i18n/intl';
import { $isDarkMode, toggleTheme } from '@/stores/theme-store';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const isDarkMode = useStore($isDarkMode);
  const isMobile = useIsMobile();
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    setActiveLang(currentLocale);
  }, [currentLocale]);

  return (
    <div
      className={`flex w-full items-center justify-between ${isMobile ? 'justify-between' : 'justify-end'}`}
    >
      {isMobile && <SidebarTrigger />}
      <div className="flex gap-(--lsd-spacing-small)">
        <ToggleGroup
          type="single"
          size="sm"
          value={activeLang}
          onValueChange={(value) => {
            if (value && value !== activeLang) {
              router.replace(pathname, { locale: value });
            }
          }}
          aria-label="Language selector"
        >
          {Object.entries(LangLabels).map(([lang, label]) => (
            <ToggleGroupItem key={lang} value={lang}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Button
          variant="outlined"
          size="sm"
          onClick={toggleTheme}
          aria-label={
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
        >
          {isDarkMode ? <PiSunFill size="1rem" /> : <PiMoonFill size="1rem" />}
        </Button>
      </div>
    </div>
  );
}
