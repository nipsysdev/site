'use client';
import { Button, ButtonGroup } from '@nipsys/shadcn-lsd';
import { useLocale } from 'next-intl';
import { PiGithubLogoFill, PiMoonFill, PiSunFill } from 'react-icons/pi';
import { LangLabels } from '@/constants/lang';
import { useAppContext } from '@/contexts/AppContext';
import { Link, usePathname } from '@/i18n/intl';
import styles from '@/styles/components.module.css';
import { cx } from '@/utils/helpers';

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const { isDarkMode, setIsDarkMode } = useAppContext();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex w-full items-center justify-end tracking-tighter transition-colors text-(length:--lsd-body1-fontSize) gap-x-(--lsd-spacing-24)">
      <ButtonGroup>
        {Object.entries(LangLabels).map(([lang, label]) => (
          <Button
            key={lang}
            variant="outlined"
            className={cx(locale === lang && 'underline', styles.smallBtnLink)}
            size="sm"
          >
            <Link href={pathname} locale={lang}>
              {label.slice(0, 2)}
            </Link>
          </Button>
        ))}
      </ButtonGroup>

      <Button
        variant="outlined"
        size="sm"
        className={styles.smallBtnLink}
        onClick={toggleTheme}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <PiSunFill size="1rem" /> : <PiMoonFill size="1rem" />}
      </Button>

      <Button variant="outlined" size="sm" className={styles.smallBtnLink}>
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
