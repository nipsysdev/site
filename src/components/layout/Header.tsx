'use client'
import { PiGithubLogoFill } from 'react-icons/pi'
import { useLocale, useTranslations } from 'next-intl'
import { LangLabels } from '@/constants/lang'
import { Link, usePathname } from '@/i18n/intl'
import { Button } from '@acid-info/lsd-react/components'

export default function Header() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('Core')

  return (
    <div className="flex w-full items-center justify-between p-3 text-xs tracking-tighter transition-colors sm:p-5 sm:text-sm">
      <div className="flex gap-x-2 text-xs sm:text-sm">
        {Object.entries(LangLabels).map(([lang, label]) => (
          <Button
            key={lang}
            variant={locale === lang ? 'filled' : 'outlined'}
            size="small"
          >
            <Link href={pathname} locale={lang}>
              {label}
            </Link>
          </Button>
        ))}
      </div>

      <Button variant="outlined">
        <a
          className="flex items-center"
          href="https://github.com/nipsysdev/site"
          target="_blank"
        >
          <PiGithubLogoFill size="1.2rem" />
          {t('sourceCode')}
        </a>
      </Button>
    </div>
  )
}
