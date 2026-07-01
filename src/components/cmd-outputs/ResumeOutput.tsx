'use client';

import { Badge, Button, Typography } from '@nipsys/lsd';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const RESUME_PATHS = {
  en: '/resume/Xavier-SALINIERE_resume.EN.pdf',
  fr: '/resume/Xavier-SALINIERE_resume.FR.pdf',
};

export default function ResumeOutput() {
  const locale = useLocale();
  const t = useTranslations('Resume');

  const currentLocale = locale === 'fr' ? 'fr' : 'en';
  const currentPdfPath = RESUME_PATHS[currentLocale];

  return (
    <div className="flex flex-col gap-(--lsd-spacing-large) py-(--lsd-spacing-small)">
      <div className="flex flex-col gap-(--lsd-spacing-smallest)">
        <Typography variant="h2">{t('title')}</Typography>
        <Typography variant="body2" color="secondary">
          {t('subtitle')}
        </Typography>
      </div>

      <div className="flex items-center gap-(--lsd-spacing-smaller)">
        <Badge variant="outlined" size="sm">
          {t('viewing')} {currentLocale.toUpperCase()} {t('version')}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-(--lsd-spacing-smaller)">
        <Button
          variant="outlined"
          size="sm"
          asChild
          data-prevent-terminal-focus
        >
          <a href={RESUME_PATHS.en} download>
            {t('downloadEN')}
          </a>
        </Button>
        <Button
          variant="outlined"
          size="sm"
          asChild
          data-prevent-terminal-focus
        >
          <a href={RESUME_PATHS.fr} download>
            {t('downloadFR')}
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-base)">
        <div
          className="w-full max-w-6xl h-[600px] border border-(--lsd-color-border) rounded-(--lsd-shape-sm) overflow-hidden"
          data-prevent-terminal-focus
        >
          <iframe
            src={currentPdfPath}
            className="w-full h-full"
            title="Resume PDF"
          />
        </div>
      </div>

      <Typography variant="body2" color="secondary">
        {t('generationPrefix')}
        <Button
          variant="link"
          className="font-bold p-0! text-sm! h-fit!"
          asChild
        >
          <Link href="https://www.npmjs.com/package/resumed" target="_blank">
            {t('resumed')}
          </Link>
        </Button>
        {t('generationMiddle')}
        <Button
          variant="link"
          className="font-bold p-0! text-sm! h-fit!"
          asChild
        >
          <Link
            href="https://www.npmjs.com/package/jsonresume-theme-stackoverflow"
            target="_blank"
          >
            {t('stackoverflowTheme')}
          </Link>
        </Button>
        {t('generationSuffix')}
        <Button
          variant="link"
          className="font-bold p-0! text-sm! h-fit!"
          asChild
        >
          <Link href="https://github.com/nipsysdev/resume" target="_blank">
            {t('repoLink')}
          </Link>
        </Button>
        {t('generationEnd')}
      </Typography>
    </div>
  );
}
