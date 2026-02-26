'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Lang } from '@/constants/lang';
import { routing } from '@/i18n/intl';

export default function LocaleRedirect() {
  const [detectedLocale, setDetectedLocale] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const browserLocale = navigator.language.split('-')[0];
    const supportedLocale = routing.locales.includes(browserLocale as Lang)
      ? browserLocale
      : routing.defaultLocale;
    setDetectedLocale(supportedLocale);
  }, []);

  useEffect(() => {
    if (detectedLocale) {
      router.push(`/${detectedLocale}`);
    }
  }, [detectedLocale, router]);

  return null;
}
