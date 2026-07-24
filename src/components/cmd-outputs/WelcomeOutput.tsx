'use client';

import { Typography } from '@nipsys/lsd';
import { useTranslations } from 'next-intl';

export default function WelcomeOutput() {
  const t = useTranslations('Welcome');
  return (
    <div
      className="flex flex-col gap-(--lsd-spacing-small)"
      data-prevent-terminal-focus
    >
      <Typography as="h1" variant="display2" color="primary">
        {t('heroLine1')}
      </Typography>
      <Typography as="p" variant="h3" color="secondary">
        {t('heroLine2')}
      </Typography>
    </div>
  );
}
