'use client';

import { Badge, Button, ScrollArea, Typography } from '@nipsys/lsd';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ResumeHtml } from './ResumeHtml';

const RESUME_PATHS = {
  en: {
    pdf: '/resume/Xavier-SALINIERE_resume.EN.pdf',
    html: '/resume/Xavier-SALINIERE_resume.EN.html',
  },
  fr: {
    pdf: '/resume/Xavier-SALINIERE_resume.FR.pdf',
    html: '/resume/Xavier-SALINIERE_resume.FR.html',
  },
};

interface ResumeProps {
  htmlEn?: string;
  htmlFr?: string;
}

async function fetchHtml(locale: 'en' | 'fr'): Promise<string> {
  const response = await fetch(RESUME_PATHS[locale].html);
  if (!response.ok) {
    throw new Error(`Failed to fetch resume HTML: ${response.status}`);
  }
  return response.text();
}

export default function Resume({ htmlEn, htmlFr }: ResumeProps) {
  const locale = useLocale();
  const t = useTranslations('Terminal.cmds.resume');

  const currentLocale = locale === 'fr' ? 'fr' : 'en';

  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialHtml = currentLocale === 'fr' ? htmlFr : htmlEn;
    if (initialHtml) {
      setHtml(initialHtml);
      return;
    }

    fetchHtml(currentLocale)
      .then(setHtml)
      .catch((err) => {
        console.error('Failed to load resume:', err);
        setError('Failed to load resume');
      });
  }, [currentLocale, htmlEn, htmlFr]);

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
          <a href={RESUME_PATHS.en.pdf} download>
            {t('downloadEN')}
          </a>
        </Button>
        <Button variant="outlined" size="sm" asChild>
          <a href={RESUME_PATHS.fr.pdf} download>
            {t('downloadFR')}
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-(--lsd-spacing-base)">
        <div className="w-full max-w-6xl h-[600px] border border-(--lsd-color-border) rounded-(--lsd-shape-sm) overflow-hidden">
          <ScrollArea className="h-full">
            {error ? (
              <div className="p-4 text-center text-(--lsd-color-text-error)">
                {error}
              </div>
            ) : html ? (
              <ResumeHtml htmlContent={html} />
            ) : (
              <div className="p-4 text-center text-(--lsd-color-text-secondary)">
                Loading...
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
