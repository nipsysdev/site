'use client';

import { Badge, Button, Typography } from '@nipsys/lsd';
import { useLocale, useTranslations } from 'next-intl';

const RESUME_PATHS = {
  en: '/resume/Xavier-SALINIERE_resume.EN.pdf',
  fr: '/resume/Xavier-SALINIERE_resume.FR.pdf',
};

export default function Resume() {
  const locale = useLocale();
  const t = useTranslations('Terminal.cmds.resume');

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
        <Button variant="outlined" size="sm" asChild>
          <a href={RESUME_PATHS.en} download>
            {t('downloadEN')}
          </a>
        </Button>
        <Button variant="outlined" size="sm" asChild>
          <a href={RESUME_PATHS.fr} download>
            {t('downloadFR')}
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-base)">
        <div className="w-full h-[600px] border border-(--lsd-color-border) rounded-(--lsd-shape-sm) overflow-hidden">
          <iframe
            src={currentPdfPath}
            className="w-full h-full"
            title="Resume PDF"
          />
        </div>
      </div>
    </div>
  );
}
