'use client'
import { PiGithubLogoFill } from 'react-icons/pi'
import { Button, Checkbox } from '@srcpunks/src_ui'
import { useLocale, useTranslations } from 'next-intl'
import { LangLabels } from '@/constants/lang'
import { Link, usePathname } from '@/i18n/intl'
import { useAppContext } from '@/contexts/AppContext'

export default function Header() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('Core')
  const { isOldUiEnabled, setIsOldUiEnabled } = useAppContext()

  return (
    <div className="flex w-full items-center justify-between p-3 text-xs tracking-tighter transition-colors sm:p-5 sm:text-sm">
      <div className="flex gap-x-2 text-xs sm:text-sm">
        {Object.entries(LangLabels).map(([lang, label]) => (
          <Button
            key={lang}
            variant={locale === lang ? 'outline' : 'ghost'}
            asChild
          >
            <Link href={pathname} locale={lang}>
              {label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="old_ui_check"
            checked={isOldUiEnabled}
            onCheckedChange={setIsOldUiEnabled}
          />
          <label htmlFor="old_ui_check">old ui</label>
        </div>

        <Button variant="link" asChild>
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
    </div>
  )
}
