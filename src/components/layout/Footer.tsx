'use client';

import { Button, Typography } from '@nipsys/lsd';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="flex py-(--lsd-spacing-base) w-full border-t border-(--lsd-border)">
      <div className="mx-auto flex size-full max-w-[1200px] px-(--lsd-spacing-base) items-center justify-between gap-(--lsd-spacing-largest)">
        <div className="flex items-center gap-[10px]">
          <span className="status-dot" aria-hidden="true" />
          <Typography
            as="span"
            variant="label1"
            className="text-[16px]! text-(--lsd-text-secondary)"
          >
            {t('availableForContracts')}
          </Typography>
        </div>

        <Button asChild variant="filled" size="lg" aria-label={t('getInTouch')}>
          <Link href="/contact">{t('getInTouch')}</Link>
        </Button>
      </div>
    </footer>
  );
}
